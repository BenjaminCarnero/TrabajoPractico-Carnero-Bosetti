// Respuestas de error en el formato que espera front/js/api.js: { mensaje }.

// Los SPs lanzan THROW con códigos propios desde 50001: 50404 es "no existe" (404)
// y cualquier otro 50xxx es una validación de negocio (400). Agregar acá los códigos de no encontrado.
const CODIGOS_NO_ENCONTRADO = [50404];

function obtenerEstado(error) {
    if (error.estado) {
        return error.estado;
    }

    // mssql deja el número del THROW en error.number
    if (error.number >= 50001 && error.number < 60000) {
        return CODIGOS_NO_ENCONTRADO.includes(error.number) ? 404 : 400;
    }

    return 500;
}

export function rutaNoEncontrada(req, res) {
    res.status(404).json({ mensaje: "Ruta no encontrada." });
}

export function manejarErrores(error, req, res, next) {
    const estado = obtenerEstado(error);
    const mensaje = estado === 500 ? "Error interno del servidor." : error.message;

    if (estado === 500) {
        console.error(error);
    }

    res.status(estado).json({ mensaje });
}
