// Rutas de la operación de reservas. Se montan en la raíz de /api porque POST /turnos
// comparte prefijo con las rutas de turnos del tablero (Express prueba ambos routers en orden).
import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as controller from "../controllers/reservas.js";

const router = Router();

router.get("/servicios", asyncHandler(controller.listarServicios));
router.get("/vehiculos/:patente", asyncHandler(controller.buscarVehiculo));
router.post("/turnos", asyncHandler(controller.crearTurno));

export default router;
