
import {
    obtenerTurnosPorEstado,
    obtenerServiciosMasSolicitados,
    obtenerListadoTurnos
} from "./api.js";

// Gráficos de columnas
function dibujarColumnas(id, datos) {
    const contenedor = document.getElementById(id);
    contenedor.innerHTML = "";

    if (!datos.length) {
        contenedor.textContent = "Sin datos disponibles.";
        return;
    }

    const maximo = Math.max(1, ...datos.map(d => d.valor));
    contenedor.style.setProperty("--cantidad-barras", datos.length);

    datos.forEach(dato => {
        const columna = document.createElement("div");
        columna.className = "estad-columna";

        const numero = document.createElement("strong");
        numero.className = "estad-valor";
        numero.textContent = dato.valor;

        const zona = document.createElement("div");
        zona.className = "estad-zona-barra";

        const barra = document.createElement("div");
        barra.className = "estad-barra";
        barra.style.height = `${dato.valor / maximo * 100}%`;
        barra.style.backgroundColor = dato.color || "#6089bd";

        const etiqueta = document.createElement("span");
        etiqueta.className = "estad-etiqueta";
        etiqueta.textContent = dato.nombre;

        zona.appendChild(barra);
        columna.append(numero, zona, etiqueta);
        contenedor.appendChild(columna);
    });
}

// Elementos SVG para gráfico de línea
function crearSVG(tipo, atributos = {}) {
    const elemento = document.createElementNS(
        "http://www.w3.org/2000/svg", tipo
    );

    Object.entries(atributos).forEach(([clave, valor]) => {
        elemento.setAttribute(clave, valor);
    });

    return elemento;
}

// Evolución de reservas
function dibujarTendencia(turnos) {
    const contenedor = document.getElementById("graficoTendencia");
    contenedor.innerHTML = "";

    const conteo = {};

    turnos.forEach(turno => {
        const fecha = String(turno.Fecha).slice(0, 10);
        conteo[fecha] = (conteo[fecha] || 0) + 1;
    });

    const fechasRegistradas = Object.keys(conteo).sort();

    if (!fechasRegistradas.length) {
        contenedor.textContent = "No hay reservas registradas.";
        return;
    }

    const ultima = new Date(
        `${fechasRegistradas.at(-1)}T00:00:00Z`
    );

    const fechas = [];

    for (let i = 6; i >= 0; i--) {
        const dia = new Date(ultima);
        dia.setUTCDate(dia.getUTCDate() - i);
        fechas.push(dia.toISOString().slice(0, 10));
    }

    const valores = fechas.map(fecha => conteo[fecha] || 0);
    const maximo = Math.max(1, ...valores);

    const svg = crearSVG("svg", {
        viewBox: "0 0 600 190",
        role: "img",
        "aria-label": "Cantidad de reservas por día"
    });

    const izquierda = 30;
    const arriba = 15;
    const ancho = 550;
    const alto = 130;

    const puntos = valores.map((valor, i) => ({
        x: izquierda + i * ancho / (valores.length - 1),
        y: arriba + alto - valor / maximo * alto
    }));

    // Líneas de referencia
    for (let i = 0; i <= 2; i++) {
        const y = arriba + alto * i / 2;

        svg.appendChild(crearSVG("line", {
            x1: izquierda, y1: y,
            x2: izquierda + ancho, y2: y,
            stroke: "#e6ebf2",
            "stroke-dasharray": "4 4"
        }));

        const texto = crearSVG("text", {
            x: 23, y: y + 4,
            "text-anchor": "end",
            fill: "#8793a4",
            "font-size": "11"
        });

        texto.textContent = Math.round(maximo * (1 - i / 2));
        svg.appendChild(texto);
    }

    // Área suave bajo la línea
    const area = [
        `${puntos[0].x},${arriba + alto}`,
        ...puntos.map(p => `${p.x},${p.y}`),
        `${puntos.at(-1).x},${arriba + alto}`
    ].join(" ");

    svg.appendChild(crearSVG("polygon", {
        points: area,
        fill: "#eaf2fc"
    }));

    // Línea principal
    svg.appendChild(crearSVG("polyline", {
        points: puntos.map(p => `${p.x},${p.y}`).join(" "),
        fill: "none",
        stroke: "#3476c5",
        "stroke-width": "3",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
    }));

    puntos.forEach((punto, i) => {
        svg.appendChild(crearSVG("circle", {
            cx: punto.x,
            cy: punto.y,
            r: 4,
            fill: "#3476c5",
            stroke: "#ffffff",
            "stroke-width": 2
        }));

        const etiqueta = crearSVG("text", {
            x: punto.x,
            y: 170,
            "text-anchor": "middle",
            fill: "#64748b",
            "font-size": "11"
        });

        etiqueta.textContent =
            `${Number(fechas[i].slice(8, 10))}/${Number(fechas[i].slice(5, 7))}`;

        svg.appendChild(etiqueta);
    });

    contenedor.appendChild(svg);
}

// Cargar estadísticas desde SQL Server
async function cargarEstadisticas() {
    try {
        const [estados, servicios, turnos] = await Promise.all([
            obtenerTurnosPorEstado(),
            obtenerServiciosMasSolicitados(),
            obtenerListadoTurnos()
        ]);

        const cantidadEstado = nombre =>
            Number(estados.find(e => e.Estado === nombre)?.Cantidad || 0);

        document.getElementById("totalEstadTurnos").textContent =
            turnos.length;

        document.getElementById("totalConfirmados").textContent =
            cantidadEstado("Confirmado");

        document.getElementById("totalEstadFinalizados").textContent =
            cantidadEstado("Finalizado");

        const colores = {
            Pendiente: "#d7a35b",
            Confirmado: "#5689c5",
            EnProceso: "#7884b2",
            Finalizado: "#58ad91",
            Cancelado: "#d9828b"
        };

        const estadosOrdenados = [
            "Pendiente",
            "Confirmado",
            "EnProceso",
            "Finalizado",
            "Cancelado"
        ];

        dibujarColumnas(
            "graficoEstados",
            estadosOrdenados.map(estado => ({
                nombre: estado === "EnProceso" ? "En proceso" : estado,
                valor: cantidadEstado(estado),
                color: colores[estado]
            }))
        );

        dibujarColumnas(
            "graficoServicios",
            servicios.slice(0, 6).map(servicio => ({
                nombre: servicio.Servicio,
                valor: Number(servicio.VecesSolicitado),
                color: "#658fc4"
            }))
        );

        dibujarTendencia(turnos);

    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        document.getElementById("graficoEstados").textContent =
            "No se pudieron cargar las estadísticas.";
    }
}

cargarEstadisticas();
