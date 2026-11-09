import { obtenerResumen } from "../services/estadisticas.service.js";

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