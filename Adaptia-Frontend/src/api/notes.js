import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * SERVICIO DE GESTIÓN DE PACIENTES Y NOTAS CLÍNICAS - ADAPTIA
 * Centraliza las peticiones al backend y la generación de documentos PDF.
 */

const API_URL = 'http://localhost:3001/api';

// --- SECCIÓN: CONSULTAS DE PACIENTES ---

/**
 * Obtiene el perfil completo de un paciente.
 */
export const getPatientById = async (patientId) => {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}`);
        if (!response.ok) throw new Error('Error al obtener el paciente');
        return await response.json();
    } catch (error) {
        console.error("❌ API Error [getPatientById]:", error);
        throw error;
    }
};

/**
 * Obtiene el listado de notas de un paciente filtrado por seguridad (User y Clinic).
 * @param {number} patientId - ID del paciente
 * @param {number} userId - ID del profesional solicitante
 * @param {number} clinicId - ID de la clínica activa
 */
export const getPatientNotes = async (patientId, userId, clinicId) => {
    // Validación de seguridad: Prevenir peticiones incompletas
    if (!patientId || !userId || !clinicId) {
        console.warn("⚠️ Parámetros insuficientes detectados antes del fetch.");
        return { data: [] };
    }

    // Los parámetros se envían como Query Params. 
    // Nota: El backend debe usar parseInt() para evitar el error de tipos en PostgreSQL.
    const url = `${API_URL}/patients/${patientId}/notes?userId=${userId}&clinicId=${clinicId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error interno en el servidor');
        }
        return await response.json();
    } catch (error) {
        console.error("❌ API Error [getPatientNotes]:", error);
        throw error; // Re-lanzamos para que el componente maneje el estado de error
    }
};

// --- SECCIÓN: MUTACIONES (POST/PUT) ---

/**
 * Actualiza los datos de contacto o historial del paciente.
 */
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
        console.error("❌ API Error [updatePatient]:", error);
        throw error;
    }
};

/**
 * Registra una nueva evolución o nota clínica en el historial.
 */
export const saveClinicalNote = async (patientId, formData, userId, clinicId) => {
    try {
        const response = await fetch(`${API_URL}/clinical-notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_id: patientId,
                member_id: userId,
                content: formData.details || formData.content,
                title: formData.title,
                summary: formData.summary,
                category: formData.category,
                clinicId: clinicId
            })
        });
        if (!response.ok) throw new Error('Error al guardar la nota clínica');
        return await response.json();
    } catch (error) {
        console.error("❌ API Error [saveClinicalNote]:", error);
        throw error;
    }
};

// --- SECCIÓN: EXPORTACIÓN Y REPORTES ---

/**
 * Genera un reporte profesional en PDF del historial del paciente.
 * Utiliza jsPDF y autoTable para un diseño estructurado.
 */
export const exportHistoryToPDF = async (patientId, patientName) => {
    try {
        const res = await fetch(`${API_URL}/patients/${patientId}/export-pdf`);
        if (!res.ok) throw new Error('Error al obtener datos del historial');

        const { patient, notes } = await res.json();
        const doc = new jsPDF();

        // Estética Adaptia (Naranja y Turquesa)
        const primaryColor = [249, 115, 22];
        const accentColor = [13, 148, 136];

        // 1. Título y Branding
        doc.setFontSize(22);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("HISTORIAL CLÍNICO", 14, 20);

        // 2. Información del Paciente
        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.setFont(undefined, 'bold');
        doc.text(`Paciente: ${patient.name}`, 14, 30);
        doc.setFont(undefined, 'normal');
        doc.text(`Email: ${patient.email || 'N/A'} | Tel: ${patient.phone || 'N/A'}`, 14, 35);
        doc.text(`DNI: ${patient.dni || 'N/A'}`, 14, 40);

        doc.setDrawColor(230);
        doc.line(14, 45, 196, 45);

        // 3. Bloque de Antecedentes (si existen)
        const history = patient.history || {};
        let currentY = 52;

        if (history.motivo_consulta || history.antecedentes) {
            const motivoText = doc.splitTextToSize(history.motivo_consulta || "No registrado", 140);
            const blockHeight = 25 + (motivoText.length * 5);

            doc.setFillColor(248, 250, 252);
            doc.rect(14, currentY, 182, blockHeight, 'F');

            doc.setFont(undefined, 'bold');
            doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
            doc.text("ANTECEDENTES Y PERFIL DE INGRESO", 18, currentY + 8);

            doc.setFontSize(9);
            doc.setTextColor(80);
            doc.text("Motivo:", 18, currentY + 16);
            doc.setFont(undefined, 'normal');
            doc.text(motivoText, 35, currentY + 16);

            currentY += blockHeight + 10;
        }

        // 4. Tabla de Notas y Evolución
        const tableColumn = ["Fecha", "Categoría", "Detalles", "Resumen IA"];
        const tableRows = (notes || []).map(note => [
            new Date(note.created_at).toLocaleDateString(),
            note.category || 'Evolución',
            `${note.title || 'Sesión'}\n${note.content || ""}`,
            note.summary || 'N/A'
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [tableColumn],
            body: tableRows,
            headStyles: { fillColor: primaryColor },
            styles: { fontSize: 8, overflow: 'linebreak', cellPadding: 4 },
            columnStyles: {
                2: { cellWidth: 80 },
                3: { cellWidth: 50 }
            }
        });

        doc.save(`Historial_${patientName.replace(/\s+/g, '_')}.pdf`);
        return { success: true };

    } catch (error) {
        console.error("❌ Error al exportar PDF:", error);
        alert("El reporte no pudo generarse. Verifique la conexión con el servidor.");
    }
};