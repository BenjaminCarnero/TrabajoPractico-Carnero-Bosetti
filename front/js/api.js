// Único módulo que hace fetch: toda la comunicación con el back pasa por acá.
const API_URL = "/api";

async function pedirJson(url, opciones) {
    const respuesta = await fetch(url, opciones);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al comunicarse con la API.");
    }

    return datos;
}

// Las funciones exportadas de cada endpoint van acá, por ejemplo:
export function obtenerResumenTablero() {
    return pedirJson(`${API_URL}/estadisticas/resumen`);
}
// export function obtenerTurnos() { return pedirJson(`${API_URL}/turnos`); }
export function obtenerListadoTurnos() {
    return pedirJson(`${API_URL}/estadisticas/turnos`);
}

export function actualizarEstadoTurno(idTurno, estado) {
    return pedirJson(
        `${API_URL}/estadisticas/turnos/${idTurno}/estado`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ estado })
        }
    );
}

export function obtenerTurnosPorEstado() {
    return pedirJson(`${API_URL}/estadisticas/turnos-por-estado`);
}

export function obtenerServiciosMasSolicitados() {
    return pedirJson(`${API_URL}/estadisticas/servicios-mas-solicitados`);
}
