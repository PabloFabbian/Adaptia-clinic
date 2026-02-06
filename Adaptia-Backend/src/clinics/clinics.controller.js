import pool from '../config/db.js';
import React from 'react';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import InviteEmail from '../emails/InviteEmail.jsx';

// Configuración de Email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/** 1. Obtener Directorio (Miembros + Invitaciones) */
export const getClinicDirectory = async (req, res) => {
    const { id: clinicId } = req.params;
    try {
        const membersQuery = `
            SELECT m.id, m.name, u.email, r.name as role_name, m.user_id,
                COALESCE(
                    (SELECT json_agg(json_build_object('type', c.resource_type, 'granted', c.is_granted))
                    FROM consents c WHERE c.member_id = m.id), '[]'
                ) as consents
            FROM members m 
            JOIN roles r ON m.role_id = r.id 
            LEFT JOIN users u ON m.user_id = u.id 
            WHERE m.clinic_id = $1
            ORDER BY m.id DESC;
        `;
        const invitationsQuery = `
            SELECT i.id, i.email, r.name as role_name, i.status, i.created_at
            FROM invitations i 
            JOIN roles r ON i.role_id = r.id 
            WHERE i.clinic_id = $1 AND i.status = 'pending'
            ORDER BY i.created_at DESC;
        `;
        const [membersRes, invitationsRes] = await Promise.all([
            pool.query(membersQuery, [clinicId]),
            pool.query(invitationsQuery, [clinicId])
        ]);
        res.json({ members: membersRes.rows, invitations: invitationsRes.rows });
    } catch (error) {
        console.error('❌ Error en getClinicDirectory:', error);
        res.status(500).json({ error: 'Error al obtener el directorio' });
    }
};

/** 2. Obtener Matriz de Gobernanza (Permisos por Rol) */
export const getGovernance = async (req, res) => {
    // Aunque la matriz sea global, el router espera este parámetro
    const { clinicId } = req.params;
    try {
        const query = `
            SELECT r.name as role_name, c.slug as resource
            FROM role_capabilities rc
            INNER JOIN roles r ON rc.role_id = r.id
            INNER JOIN capabilities c ON rc.capability_id = c.id
        `;
        const { rows } = await pool.query(query);

        const governance = rows.reduce((acc, row) => {
            if (!acc[row.role_name]) acc[row.role_name] = [];
            acc[row.role_name].push({ resource: row.resource });
            return acc;
        }, {});

        res.json(governance);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la matriz' });
    }
};

/** 3. Crear y Enviar Invitación */
export const createInvitation = async (req, res) => {
    const { clinicId } = req.params;
    const { email, role_id, invited_by } = req.body;
    const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    try {
        await pool.query(
            `INSERT INTO invitations (clinic_id, email, role_id, token, invited_by, status) VALUES ($1, $2, $3, $4, $5, 'pending')`,
            [clinicId, email.toLowerCase(), role_id, token, invited_by]
        );

        const info = await pool.query(
            `SELECT (SELECT name FROM clinics WHERE id = $1) as c_name, (SELECT name FROM users WHERE id = $2) as s_name`,
            [clinicId, invited_by]
        );

        const emailHtml = await render(
            React.createElement(InviteEmail, {
                clinicName: info.rows[0]?.c_name || "Clínica",
                senderName: info.rows[0]?.s_name || "Colega",
                inviteLink: `${process.env.FRONTEND_URL}/register?token=${token}`
            })
        );

        await transporter.sendMail({
            from: `"Adaptia" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Invitación a colaborar en ${info.rows[0]?.c_name || 'Adaptia'}`,
            html: emailHtml,
        });

        res.status(201).json({ success: true });
    } catch (err) {
        console.error('❌ Error en createInvitation:', err);
        res.status(500).json({ error: "Error al enviar invitación" });
    }
};

/** 4. Catálogo de Capacidades (Sincronizado con Neon) */
export const getAllCapabilities = async (req, res) => {
    try {
        // Consultamos solo las columnas que Neon confirmó que existen
        const { rows } = await req.pool.query(`SELECT id, slug FROM capabilities ORDER BY slug ASC`);

        // Transformamos el slug para que el usuario vea algo legible
        // Ejemplo: 'clinic.patients.read' -> 'patients read'
        const capabilitiesWithNames = rows.map(cap => ({
            ...cap,
            name: cap.slug
                .replace('clinic.', '') // Quita el prefijo
                .replace(/\./g, ' ')    // Cambia puntos por espacios
                .toUpperCase()          // Lo pone en mayúsculas para que resalte
        }));

        res.json(capabilitiesWithNames);
    } catch (error) {
        console.error('❌ Error en getAllCapabilities:', error);
        res.status(500).json({ error: 'Error al obtener capacidades' });
    }
};

/** 5. Toggle de Permisos por Rol (Gobernanza) */
export const toggleRolePermission = async (req, res) => {
    const { role_name, capability_id, action } = req.body;
    try {
        if (action === 'grant') {
            await pool.query(`
                INSERT INTO role_capabilities (role_id, capability_id) 
                VALUES ((SELECT id FROM roles WHERE name = $1 LIMIT 1), $2) 
                ON CONFLICT DO NOTHING`, [role_name, capability_id]);
        } else {
            await pool.query(`
                DELETE FROM role_capabilities 
                WHERE role_id = (SELECT id FROM roles WHERE name = $1 LIMIT 1) 
                AND capability_id = $2`, [role_name, capability_id]);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar permiso de rol' });
    }
};

/** 6. Toggle de Consentimiento Individual (Soberanía de Datos) */
export const toggleMemberConsent = async (req, res) => {
    const { memberId } = req.params;
    const { resource_slug, granted } = req.body;
    try {
        const query = `
            INSERT INTO consents (member_id, resource_type, is_granted, clinic_id)
            VALUES ($1, $2, $3, (SELECT clinic_id FROM members WHERE id = $1))
            ON CONFLICT (member_id, resource_type, clinic_id) 
            DO UPDATE SET is_granted = EXCLUDED.is_granted
        `;
        await pool.query(query, [memberId, resource_slug, granted]);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error en toggleMemberConsent:', error);
        res.status(500).json({ error: 'Error al actualizar soberanía' });
    }
};