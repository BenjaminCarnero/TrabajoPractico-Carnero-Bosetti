import { formatearPrecio } from "../formato.js";

function formatearDuracion(minutos) {
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;

    if (horas === 0) {
        return `${resto} min`;
    }

    return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

export function dibujarResumen(contenedor, elegidos) {
    contenedor.replaceChildren();

    if (elegidos.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "aviso";
        vacio.textContent = "Todavía no elegiste ningún servicio.";
        contenedor.append(vacio);
        return;
    }

    const lista = document.createElement("ul");
    lista.className = "resumen-lista";

    let total = 0;
    let minutos = 0;

    for (const { servicio, cantidad } of elegidos) {
        const subtotal = servicio.Precio * cantidad;
        total += subtotal;
        minutos += servicio.DuracionMinutos * cantidad;

        const item = document.createElement("li");
        const detalle = document.createElement("span");
        detalle.textContent = `${cantidad} × ${servicio.Nombre}`;
        const importe = document.createElement("span");
        importe.textContent = formatearPrecio(subtotal);
        item.append(detalle, importe);
        lista.append(item);
    }

    const pie = document.createElement("p");
    pie.className = "resumen-total";
    pie.textContent = `Total: ${formatearPrecio(total)}`;

    const duracion = document.createElement("p");
    duracion.className = "aviso";
    duracion.textContent = `Duración estimada: ${formatearDuracion(minutos)}`;

    contenedor.append(lista, pie, duracion);
}
