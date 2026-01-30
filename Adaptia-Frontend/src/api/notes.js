import { jsPDF } from "jspdf";
import "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Guarda una nueva nota clínica
 */
export const saveClinicalNote = async (patientId, noteData) => {
    try {
        const response = await fetch(`${API_URL}/clinical-notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_id: patientId,
                member_id: noteData.member_id || 1,
                title: noteData.title,
                content: noteData.details || noteData.content,
                category: noteData.category,
                summary: noteData.summary
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al guardar la nota');
        }
        return await response.json();
    } catch (error) {
        console.error("❌ Error en saveClinicalNote:", error);
        throw error;
    }
};

/**
 * Obtiene todas las notas de un paciente
 */
export const getPatientNotes = async (patientId) => {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}/notes`);
        if (!response.ok) throw new Error('Error al obtener notas');
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error("❌ Error en getPatientNotes:", error);
        return [];
    }
};

/**
 * Actualiza la información del perfil del paciente
 */
export const updatePatientProfile = async (patientId, profileData) => {
    try {
        // Aseguramos que los campos planos y el objeto history viajen correctamente
        const response = await fetch(`${API_URL}/patients/${patientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
                history: profileData.history // Aquí va el DNI, dirección, etc.
            }),
        });

        if (!response.ok) throw new Error('Error al actualizar el perfil');
        return await response.json();
    } catch (error) {
        console.error("❌ Error en updatePatientProfile:", error);
        throw error;
    }
};

/**
 * Genera el PDF en el cliente usando jsPDF
 */
export const exportHistoryToPDF = async (patientId, patientName) => {
    try {
        // 1. Obtener datos combinados del backend
        const res = await fetch(`${API_URL}/patients/${patientId}/export-pdf`);
        if (!res.ok) throw new Error('Error al obtener datos para el PDF');
        const { patient, notes } = await res.json();

        // 2. Configurar el documento
        const doc = new jsPDF();
        const primaryColor = [249, 115, 22]; // Naranja

        // Header
        doc.setFontSize(22);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("HISTORIAL CLÍNICO", 14, 20);

        // Info Paciente
        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.setFont(undefined, 'bold');
        doc.text(`Paciente: ${patient.name}`, 14, 30);
        doc.setFont(undefined, 'normal');
        doc.text(`Email: ${patient.email || 'N/A'} | Tel: ${patient.phone || 'N/A'}`, 14, 35);
        doc.text(`DNI: ${patient.history?.dni || 'N/A'}`, 14, 40);

        doc.setDrawColor(230);
        doc.line(14, 45, 196, 45);

        // 3. Crear tabla de notas
        const tableColumn = ["Fecha", "Categoría", "Detalles de la sesión", "Resumen IA"];
        const tableRows = notes.map(note => [
            new Date(note.created_at).toLocaleDateString(),
            note.category || 'Evolución',
            `${note.title}\n${note.content.substring(0, 150)}...`,
            note.summary || 'Sin resumen'
        ]);

        doc.autoTable({
            startY: 50,
            head: [tableColumn],
            body: tableRows,
            headStyles: { fillColor: primaryColor },
            styles: { fontSize: 8, cellPadding: 4 },
            columnStyles: {
                2: { cellWidth: 70 },
                3: { cellWidth: 50 }
            }
        });

        // 4. Descarga
        doc.save(`Historial_${patientName.replace(/\s+/g, '_')}.pdf`);
        return { success: true };

    } catch (error) {
        console.error("❌ Error al exportar PDF:", error);
        alert("Error al generar el PDF");
    }
};