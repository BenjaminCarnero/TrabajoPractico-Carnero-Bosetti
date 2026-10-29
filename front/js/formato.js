// Formatos compartidos por todas las páginas.
const formatoPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

export function formatearPrecio(valor) {
    return formatoPrecio.format(valor);
}
