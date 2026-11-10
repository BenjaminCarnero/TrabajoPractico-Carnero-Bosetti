
import { obtenerResumenTablero, obtenerListadoTurnos, actualizarEstadoTurno } from "./api.js";

async function cargarTablero() {
    try {
        const datos = await obtenerResumenTablero();
        const resumen = datos[0];

        document.getElementById("totalClientes").textContent = resumen.TotalClientes;
        document.getElementById("totalTurnos").textContent = resumen.TotalTurnos;
        document.getElementById("turnosPendientes").textContent = resumen.TurnosPendientes;
        document.getElementById("turnosFinalizados").textContent = resumen.TurnosFinalizados;

    } catch (error) {
        console.error("Error al cargar el tablero:", error);
    }
}

async function cargarTurnos() {
    try {
        const turnos = await obtenerListadoTurnos();
        const tabla = document.getElementById("tablaTurnos");

        tabla.innerHTML = "";

        turnos.forEach(turno => {
            const fila = document.createElement("tr");

            const valores = [
                String(turno.Fecha).slice(0, 10),
                String(turno.Hora).includes("T")
                    ? String(turno.Hora).split("T")[1].slice(0, 5)
                    : String(turno.Hora).slice(0, 5),
                `${turno.Nombre} ${turno.Apellido}`,
                turno.Patente,
                `${turno.Marca} ${turno.Modelo}`,
                turno.Servicios,
                `$${Number(turno.Total || 0).toLocaleString("es-AR")}`,
                turno.Estado
            ];

            valores.forEach(valor => {
                const celda = document.createElement("td");
                celda.textContent = valor ?? "";
                fila.appendChild(celda);
            });
            
const celdaAccion = document.createElement("td");
const selector = document.createElement("select");

const estados = [
    "Pendiente",
    "Confirmado",
    "EnProceso",
    "Finalizado",
    "Cancelado"
];

estados.forEach(estado => {
    const opcion = document.createElement("option");
    opcion.value = estado;
    opcion.textContent = estado;
    opcion.selected = estado === turno.Estado;
    selector.appendChild(opcion);
});

const boton = document.createElement("button");
boton.textContent = "Guardar";

boton.addEventListener("click", async () => {
    boton.disabled = true;

    try {
        await actualizarEstadoTurno(turno.ID_Turno, selector.value);
        await cargarTablero();
        await cargarTurnos();
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        alert("No se pudo actualizar el estado.");
        boton.disabled = false;
    }
});

celdaAccion.appendChild(selector);
celdaAccion.appendChild(boton);
fila.appendChild(celdaAccion);


            tabla.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al cargar turnos:", error);
    }
}

cargarTablero();
cargarTurnos();


function filtrarTurnos() {
    const cliente = document.getElementById("filtroCliente").value.toLowerCase();
    const patente = document.getElementById("filtroPatente").value.toLowerCase();
    const estado = document.getElementById("filtroEstado").value;

    const filas = document.querySelectorAll("#tablaTurnos tr");

    filas.forEach(fila => {
        const nombreCliente = fila.cells[2].textContent.toLowerCase();
        const patenteVehiculo = fila.cells[3].textContent.toLowerCase();
        const estadoTurno = fila.cells[7].textContent.trim();

        const coincide =
            nombreCliente.includes(cliente) &&
            patenteVehiculo.includes(patente) &&
            (estado === "" || estadoTurno === estado);

        fila.style.display = coincide ? "" : "none";
    });
}

document.getElementById("filtroCliente").addEventListener("input", filtrarTurnos);
document.getElementById("filtroPatente").addEventListener("input", filtrarTurnos);
document.getElementById("filtroEstado").addEventListener("change", filtrarTurnos);