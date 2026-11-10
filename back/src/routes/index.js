import { Router } from "express";
import reservasRouter from "./reservas.js";
import estadisticasRouter from "./estadisticas.routes.js";

const router = Router();

router.use(reservasRouter);
router.use("/estadisticas", estadisticasRouter);

export default router;
