// Único módulo que hace fetch: toda la comunicación con el back pasa por acá.
const API_URL = "/api";

async function pedirJson(url, opciones) {
    const respuesta = await fetch(url, opciones);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        const error = new Error(datos.mensaje || "Error al comunicarse con la API.");
        error.estado = respuesta.status;
        throw error;
    }

    return datos;
}

// Las funciones exportadas de cada endpoint van acá, por ejemplo:
// export function obtenerTurnos() { return pedirJson(`${API_URL}/turnos`); }

export function obtenerServiciosActivos() {
    return pedirJson(`${API_URL}/servicios`);
}

export function buscarVehiculo(patente) {
    return pedirJson(`${API_URL}/vehiculos/${encodeURIComponent(patente)}`);
}

export function crearTurno(reserva) {
    return pedirJson(`${API_URL}/turnos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reserva)
    });
}
