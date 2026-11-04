// Envuelve un controller async para que cualquier error llegue al middleware de errores
// sin repetir try/catch en cada controller.
export function asyncHandler(controller) {
    return (req, res, next) => {
        Promise.resolve(controller(req, res, next)).catch(next);
    };
}
