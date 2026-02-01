export const getRoles = async (req, res) => {
    try {
        // Consultamos solo lo que necesitamos para el modal
        const query = 'SELECT id, name FROM roles ORDER BY id ASC';
        const { rows } = await req.pool.query(query);

        if (!rows || rows.length === 0) {
            console.warn("⚠️ La tabla roles está vacía.");
            return res.json([]);
        }

        res.json(rows);
    } catch (err) {
        console.error("❌ Error en getRoles:", err.message);

        // Si hay un error de base de datos (como el que tuviste), 
        // enviamos una respuesta controlada para que el frontend no rompa
        res.status(500).json({
            error: "Error al cargar niveles de gobernanza",
            message: err.message
        });
    }
};