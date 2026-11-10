
import { Router } from "express";
import {
    consultarResumen,
    consultarListadoTurnos,
    actualizarEstadoTurno,
    consultarTurnosPorEstado,
    consultarServiciosMasSolicitados
} from "../controllers/estadisticas.controllers.js";

const router = Router();

router.get("/resumen", consultarResumen);
router.get("/turnos", consultarListadoTurnos);
router.patch("/turnos/:id/estado", actualizarEstadoTurno);

router.get("/turnos-por-estado", consultarTurnosPorEstado);
router.get("/servicios-mas-solicitados", consultarServiciosMasSolicitados);

export default router;
