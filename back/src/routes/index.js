// Acá se monta cada router de la API bajo /api. Cada integrante agrega solo sus rutas.
import { Router } from "express";
import estadisticasrouter from"./estadisticas.routes.js";

const router = Router();

// router.use("/servicios", serviciosRouter);
// router.use("/turnos", turnosRouter);
router.use("/estadisticas", estadisticasrouter);

export default router;
