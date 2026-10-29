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
// export function obtenerTurnos() { return pedirJson(`${API_URL}/turnos`); }
