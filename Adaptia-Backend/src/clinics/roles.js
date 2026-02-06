/**
 * GET /api/clinics/roles
 * Retorna el catálogo global de roles para la matriz de gobernanza
 */
export const getRoles = async (req, res) => {
    try {
        // Consultamos id y name (puedes agregar description si la necesitas luego)
        const query = 'SELECT id, name FROM roles ORDER BY id ASC';

        // Usamos req.pool inyectado en index.js
        const { rows } = await req.pool.query(query);

        // Si no hay filas, devolvemos un array vacío pero con status 200
        // Esto evita que el frontend lance un error al intentar iterar
        res.json(rows || []);

    } catch (err) {
        console.error("❌ Error en getRoles:", err.message);

        // Respuesta controlada: el frontend recibirá un 500 y podrá manejar el error
        res.status(500).json({
            error: "Error al cargar niveles de gobernanza",
            message: err.message
        });
    }
};