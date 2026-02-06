import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// 1. Corregimos la URL para que siempre incluya /api, que es lo que espera tu index.js
const API_URL = 'http://localhost:3001/api';

export const getPatientById = async (patientId) => {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}`);
        if (!response.ok) throw new Error('Error al obtener el paciente');
        const result = await response.json();
        // Tu backend devuelve { data: { ... } }, lo devolvemos tal cual para el componente
        return result;
    } catch (error) {
        console.error("❌ Error en getPatientById:", error);
        throw error;
    }
};

export const getPatientNotes = async (patientId) => {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}/notes`);
        if (!response.ok) throw new Error('Error al obtener notas');
        const result = await response.json();

        // Tu backend devuelve { data: [notes] }
        if (result && result.data && Array.isArray(result.data)) return result.data;
        if (Array.isArray(result)) return result;
        return [];
    } catch (error) {
        console.error("❌ Error en getPatientNotes:", error);
        return [];
    }
};

export const updatePatient = async (patientId, patientData) => {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData),
        });
        if (!response.ok) throw new Error('Error al actualizar el paciente');
        return await response.json();
    } catch (error) {
        console.error("❌ Error en updatePatient:", error);
        throw error;
    }
};

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

export const exportHistoryToPDF = async (patientId, patientName) => {
    try {
        // Esta ruta coincide con el router.get('/:id/export-pdf' de tu patients.js
        const res = await fetch(`${API_URL}/patients/${patientId}/export-pdf`);
        if (!res.ok) throw new Error('Error al obtener datos para el PDF');

        const { patient, notes } = await res.json();

        const doc = new jsPDF();
        const primaryColor = [249, 115, 22]; // Naranja Adaptia
        const accentColor = [13, 148, 136];  // Turquesa/Teal

        // --- Encabezado ---
        doc.setFontSize(22);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("HISTORIAL CLÍNICO", 14, 20);

        // --- Datos del Paciente ---
        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.setFont(undefined, 'bold');
        doc.text(`Paciente: ${patient.name}`, 14, 30);
        doc.setFont(undefined, 'normal');
        doc.text(`Email: ${patient.email || 'N/A'} | Tel: ${patient.phone || 'N/A'}`, 14, 35);

        const dni = patient.dni || patient.history?.dni || 'N/A';
        doc.text(`DNI: ${dni}`, 14, 40);

        doc.setDrawColor(230);
        doc.line(14, 45, 196, 45);

        // --- Perfil Psicológico ---
        const history = patient.history || {};
        let currentY = 52;

        if (history.motivo_consulta || history.antecedentes || history.medicacion) {
            const motivoText = doc.splitTextToSize(history.motivo_consulta || "No registrado", 140);
            const blockHeight = 30 + (motivoText.length * 5);

            doc.setFillColor(248, 250, 252);
            doc.rect(14, currentY, 182, blockHeight, 'F');

            doc.setFont(undefined, 'bold');
            doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
            doc.text("ANTECEDENTES Y PERFIL DE INGRESO", 18, currentY + 8);

            doc.setFontSize(9);
            doc.setTextColor(80);

            doc.setFont(undefined, 'bold');
            doc.text("Motivo:", 18, currentY + 16);
            doc.setFont(undefined, 'normal');
            doc.text(motivoText, 35, currentY + 16);

            doc.setFont(undefined, 'bold');
            doc.text("Medicación:", 18, currentY + 16 + (motivoText.length * 5) + 2);
            doc.setFont(undefined, 'normal');
            doc.text(history.medicacion || "Ninguna", 42, currentY + 16 + (motivoText.length * 5) + 2);

            currentY += blockHeight + 10;
        }

        // --- Tabla de Notas ---
        const tableColumn = ["Fecha", "Categoría", "Detalles de Sesión", "Resumen IA"];
        const tableRows = (notes || []).map(note => [
            new Date(note.created_at).toLocaleDateString(),
            note.category || 'Evolución',
            `${note.title || 'Sesión'}\n\n${note.content || note.details || ""}`,
            note.summary || 'N/A'
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [tableColumn],
            body: tableRows,
            headStyles: { fillColor: primaryColor },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            styles: {
                fontSize: 8,
                cellPadding: 4,
                overflow: 'linebreak',
                valign: 'top'
            },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 25 },
                2: { cellWidth: 85 },
                3: { cellWidth: 50 }
            }
        });

        doc.save(`Historial_${patientName.replace(/\s+/g, '_')}.pdf`);
        return { success: true };

    } catch (error) {
        console.error("❌ Error al exportar PDF:", error);
        alert("Error al generar el PDF");
    }
};