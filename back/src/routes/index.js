// Acá se monta cada router de la API bajo /api. Cada integrante agrega solo sus rutas.
import { Router } from "express";
import reservasRouter from "./reservas.js";

const router = Router();

router.use(reservasRouter);
// router.use("/turnos", turnosRouter);
// router.use("/estadisticas", estadisticasRouter);

export default router;
