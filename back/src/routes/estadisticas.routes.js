import { Router } from "express";
import {
    consultarResumen,
    consultarListadoTurnos,
    actualizarEstadoTurno
} from "../controllers/estadisticas.controllers.js";

const router = Router();

router.get("/turnos-por-estado", (req, res) => {
    res.json({ mensaje: "Ruta de estados funcionando" });
});

router.get("/resumen", consultarResumen);
router.get("/turnos", consultarListadoTurnos);
router.patch("/turnos/:id/estado", actualizarEstadoTurno);

router.get("/servicios-mas-solicitados", (req, res) => {
    res.json({ mensaje: "Ruta de servicios funcionando" });
});


export default router;