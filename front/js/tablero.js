import { obtenerResumenTablero } from './api.js';

async function cargarTablero(){ try { 
    const datos = await obtenerResumenTablero();
    const resumen = datos[0];

document.getElementById("totalClientes").textContent = resumen.TotalClientes;
document.getElementById("totalTurnos").textContent = resumen.TotalTurnos;
document.getElementById("turnosPendientes").textContent = resumen.TurnosPendientes;
document.getElementById("turnosFinalizados").textContent = resumen.TurnosFinalizados;
    console.log("Datos del tablero:", datos);
    } catch (error) {
        console.error("Error al cargar el tablero:", error);
    }
}

cargarTablero();