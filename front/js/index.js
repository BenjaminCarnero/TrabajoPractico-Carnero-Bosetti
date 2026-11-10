import { obtenerServiciosActivos, buscarVehiculo, crearTurno } from "./api.js";
import { dibujarListaServicios } from "./componentes/listaServicios.js";
import { dibujarResumen } from "./componentes/resumenReserva.js";
import { formatearPrecio } from "./formato.js";

const formulario = document.getElementById("form-reserva");
const campoPatente = document.getElementById("patente");
const botonBuscar = document.getElementById("boton-buscar");
const avisoPatente = document.getElementById("aviso-patente");
const datosVehiculo = document.getElementById("datos-vehiculo");
const datosNuevos = document.getElementById("datos-nuevos");
const listaServicios = document.getElementById("lista-servicios");
const campoFecha = document.getElementById("fecha");
const campoHora = document.getElementById("hora");
const resumen = document.getElementById("resumen");
const mensaje = document.getElementById("mensaje");
const botonReservar = document.getElementById("boton-reservar");

let servicios = [];
const cantidades = new Map();
let patenteConsultada = null;
let esVehiculoNuevo = false;

function normalizarPatente(texto) {
    return texto.replace(/\s/g, "").toUpperCase();
}

function fechaDeHoy() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    mensaje.hidden = false;
}

function ocultarMensaje() {
    mensaje.hidden = true;
}

function mostrarAvisoPatente(texto) {
    avisoPatente.textContent = texto;
    avisoPatente.hidden = texto === "";
}

function actualizarResumen() {
    const elegidos = servicios
        .filter((servicio) => cantidades.get(servicio.ID_Servicio) > 0)
        .map((servicio) => ({ servicio, cantidad: cantidades.get(servicio.ID_Servicio) }));
    dibujarResumen(resumen, elegidos);
}

function reiniciarVehiculo() {
    patenteConsultada = null;
    esVehiculoNuevo = false;
    datosVehiculo.hidden = true;
    datosNuevos.hidden = true;
    mostrarAvisoPatente("");
}

function dibujarFichaVehiculo(vehiculo) {
    const filas = [
        ["Cliente", `${vehiculo.Nombre} ${vehiculo.Apellido}`],
        ["Teléfono", vehiculo.Telefono],
        ["Vehículo", `${vehiculo.Marca} ${vehiculo.Modelo} (${vehiculo.TipoVehiculo})`]
    ];

    datosVehiculo.replaceChildren();
    for (const [titulo, valor] of filas) {
        const dt = document.createElement("dt");
        dt.textContent = titulo;
        const dd = document.createElement("dd");
        dd.textContent = valor;
        datosVehiculo.append(dt, dd);
    }
}

async function buscarPatente() {
    const patente = normalizarPatente(campoPatente.value);
    ocultarMensaje();

    if (patente === "") {
        reiniciarVehiculo();
        mostrarAvisoPatente("Ingresá una patente para buscar.");
        return;
    }

    botonBuscar.disabled = true;
    try {
        const vehiculo = await buscarVehiculo(patente);
        dibujarFichaVehiculo(vehiculo);
        esVehiculoNuevo = false;
        datosVehiculo.hidden = false;
        datosNuevos.hidden = true;
        mostrarAvisoPatente("Vehículo registrado: se reserva con estos datos.");
    } catch (error) {
        if (error.estado !== 404) {
            reiniciarVehiculo();
            mostrarAvisoPatente(error.message);
            return;
        }
        esVehiculoNuevo = true;
        datosVehiculo.hidden = true;
        datosNuevos.hidden = false;
        mostrarAvisoPatente("Patente nueva: completá los datos del cliente y del vehículo.");
    } finally {
        botonBuscar.disabled = false;
    }

    campoPatente.value = patente;
    patenteConsultada = patente;
}

function valor(id) {
    return document.getElementById(id).value.trim();
}

function armarReserva() {
    const reserva = {
        patente: patenteConsultada,
        fecha: campoFecha.value,
        hora: campoHora.value,
        servicios: [...cantidades]
            .filter(([, cantidad]) => cantidad > 0)
            .map(([idServicio, cantidad]) => ({ idServicio, cantidad }))
    };

    if (esVehiculoNuevo) {
        reserva.cliente = {
            nombre: valor("nombre"),
            apellido: valor("apellido"),
            telefono: valor("telefono"),
            email: valor("email") || undefined
        };
        reserva.vehiculo = {
            marca: valor("marca"),
            modelo: valor("modelo"),
            tipoVehiculo: valor("tipo-vehiculo")
        };
    }

    return reserva;
}

function validarReserva(reserva) {
    if (patenteConsultada === null || patenteConsultada !== normalizarPatente(campoPatente.value)) {
        return "Buscá la patente antes de reservar.";
    }
    if (reserva.servicios.length === 0) {
        return "Elegí al menos un servicio.";
    }
    if (reserva.fecha === "" || reserva.hora === "") {
        return "Elegí la fecha y la hora del turno.";
    }
    return null;
}

function formatearFecha(fechaIso) {
    const [anio, mes, dia] = fechaIso.split("-");
    return `${dia}/${mes}/${anio}`;
}

function limpiarFormulario() {
    formulario.reset();
    cantidades.clear();
    reiniciarVehiculo();
    campoFecha.min = fechaDeHoy();
    dibujarListaServicios(listaServicios, servicios, alCambiarServicio);
    actualizarResumen();
}

async function reservar(evento) {
    evento.preventDefault();
    ocultarMensaje();

    const reserva = armarReserva();
    const problema = validarReserva(reserva);
    if (problema) {
        mostrarMensaje(problema, "error");
        return;
    }

    botonReservar.disabled = true;
    try {
        const turno = await crearTurno(reserva);
        limpiarFormulario();
        mostrarMensaje(
            `Turno #${turno.ID_Turno} reservado para ${turno.Patente} el ${formatearFecha(turno.Fecha)} ` +
            `a las ${turno.Hora}. Total: ${formatearPrecio(turno.Total)}.`,
            "ok"
        );
    } catch (error) {
        mostrarMensaje(error.message, "error");
    } finally {
        botonReservar.disabled = false;
    }
}

function alCambiarServicio(idServicio, unidades) {
    cantidades.set(idServicio, unidades);
    actualizarResumen();
}

async function iniciar() {
    campoFecha.min = fechaDeHoy();
    actualizarResumen();

    botonBuscar.addEventListener("click", buscarPatente);
    campoPatente.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            buscarPatente();
        }
    });
    campoPatente.addEventListener("input", reiniciarVehiculo);
    formulario.addEventListener("submit", reservar);

    try {
        servicios = await obtenerServiciosActivos();
        dibujarListaServicios(listaServicios, servicios, alCambiarServicio);
    } catch (error) {
        listaServicios.textContent = `No se pudieron cargar los servicios: ${error.message}`;
    }
}

iniciar();
