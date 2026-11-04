// Respuestas de error en el formato que espera front/js/api.js: { mensaje }.
export function rutaNoEncontrada(req, res) {
    res.status(404).json({ mensaje: "Ruta no encontrada." });
}

export function manejarErrores(error, req, res, next) {
    const estado = error.estado || 500;
    const mensaje = estado === 500 ? "Error interno del servidor." : error.message;

    if (estado === 500) {
        console.error(error);
    }

    res.status(estado).json({ mensaje });
}
