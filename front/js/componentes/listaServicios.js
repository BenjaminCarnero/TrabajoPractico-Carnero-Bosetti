import { formatearPrecio } from "../formato.js";

export function dibujarListaServicios(contenedor, servicios, alCambiar) {
    contenedor.replaceChildren();

    if (servicios.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "aviso";
        vacio.textContent = "No hay servicios activos por el momento.";
        contenedor.append(vacio);
        return;
    }

    for (const servicio of servicios) {
        contenedor.append(crearFila(servicio, alCambiar));
    }
}

function crearFila(servicio, alCambiar) {
    const fila = document.createElement("div");
    fila.className = "servicio";

    const etiqueta = document.createElement("label");
    etiqueta.className = "servicio-texto";

    const marca = document.createElement("input");
    marca.type = "checkbox";
    marca.setAttribute("aria-label", servicio.Nombre);

    const nombre = document.createElement("strong");
    nombre.textContent = servicio.Nombre;

    const descripcion = document.createElement("small");
    descripcion.textContent = `${servicio.Descripcion ?? ""} · ${servicio.DuracionMinutos} min`;

    const textos = document.createElement("span");
    textos.append(nombre, descripcion);
    etiqueta.append(marca, textos);

    const precio = document.createElement("span");
    precio.className = "servicio-precio";
    precio.textContent = formatearPrecio(servicio.Precio);

    const cantidad = document.createElement("input");
    cantidad.type = "number";
    cantidad.className = "servicio-cantidad";
    cantidad.min = "1";
    cantidad.max = "20";
    cantidad.value = "1";
    cantidad.disabled = true;
    cantidad.setAttribute("aria-label", `Cantidad de ${servicio.Nombre}`);

    function avisar() {
        const unidades = marca.checked ? Number(cantidad.value) : 0;
        alCambiar(servicio.ID_Servicio, unidades > 0 ? unidades : 0);
    }

    marca.addEventListener("change", () => {
        cantidad.disabled = !marca.checked;
        avisar();
    });
    cantidad.addEventListener("input", avisar);

    fila.append(etiqueta, precio, cantidad);
    return fila;
}
