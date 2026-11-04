// Traduce HTTP a llamadas al service de reservas. Las reglas de negocio las valida el SP;
// acá solo se chequea que el pedido tenga la forma esperada para no mandar basura a la base.
import * as reservas from "../services/reservas.js";

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_HORA = /^\d{2}:\d{2}(:\d{2})?$/;

function errorDePedido(mensaje) {
    const error = new Error(mensaje);
    error.estado = 400;
    return error;
}

export async function listarServicios(req, res) {
    res.json(await reservas.listarServiciosActivos());
}

export async function buscarVehiculo(req, res) {
    res.json(await reservas.buscarVehiculoPorPatente(req.params.patente));
}

export async function crearTurno(req, res) {
    const { patente, fecha, hora, servicios, cliente, vehiculo } = req.body;

    if (!FORMATO_FECHA.test(fecha ?? "")) {
        throw errorDePedido("La fecha tiene que tener el formato AAAA-MM-DD.");
    }

    if (!FORMATO_HORA.test(hora ?? "")) {
        throw errorDePedido("La hora tiene que tener el formato HH:MM.");
    }

    if (!Array.isArray(servicios) || servicios.length === 0) {
        throw errorDePedido("Hay que elegir al menos un servicio.");
    }

    const turno = await reservas.crearTurno({ patente, fecha, hora, servicios, cliente, vehiculo });
    res.status(201).json(turno);
}
