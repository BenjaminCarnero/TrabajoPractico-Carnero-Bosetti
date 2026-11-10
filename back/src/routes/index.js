
import { Router } from "express";
import estadisticasRouter from "./estadisticas.routes.js";

const router = Router();

router.use("/estadisticas", estadisticasRouter);

export default router;
