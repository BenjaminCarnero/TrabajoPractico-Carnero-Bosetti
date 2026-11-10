import {
    obtenerResumen,
    obtenerListadoTurnos,
    cambiarEstadoTurno,
    obtenerTurnosPorEstado,
    obtenerServiciosMasSolicitados
} from "../services/estadisticas.service.js";

export async function consultarResumen(req, res) {
    try {
        const datos = await obtenerResumen();
        res.json(datos);
    } catch (error) {
        console.error("Error al obtener resumen:", error);
        res.status(500).json({
            mensaje: "Error al consultar el tablero"
        });
    }
}

export async function consultarListadoTurnos(req, res, next) {
    try {
        const turnos = await obtenerListadoTurnos();
        res.json(turnos);
    } catch (error) {
        next(error);
    }
}

export async function actualizarEstadoTurno(req, res, next) {
    try {
        const idTurno = Number(req.params.id);
        const { estado } = req.body;

        if (!Number.isInteger(idTurno) || idTurno <= 0) {
            return res.status(400).json({
                mensaje: "ID de turno inválido"
            });
        }

        if (!["Pendiente", "Confirmado", "EnProceso", "Finalizado", "Cancelado"].includes(estado)) {
            return res.status(400).json({
                mensaje: "Estado inválido"
            });
        }

        await cambiarEstadoTurno(idTurno, estado);

        res.json({
            mensaje: "Estado actualizado correctamente"
        });
    } catch (error) {
        next(error);
    }
}

export async function consultarTurnosPorEstado(req, res, next) {
    try {
        const datos = await obtenerTurnosPorEstado();
        res.json(datos);
    } catch (error) {
        next(error);
    }
}

export async function consultarServiciosMasSolicitados(req, res, next) {
    try {
        const datos = await obtenerServiciosMasSolicitados();
        res.json(datos);
    } catch (error) {
        next(error);
    }
}
