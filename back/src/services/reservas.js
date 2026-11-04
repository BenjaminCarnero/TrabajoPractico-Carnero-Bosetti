// Acceso a los SPs de reservas. Es el único lugar donde se ejecuta SQL de esta funcionalidad.
import { obtenerPool, sql } from "../config/db.js";

export async function listarServiciosActivos() {
    const pool = await obtenerPool();
    const resultado = await pool.request().execute("sp_Servicios_ListarActivos");
    return resultado.recordset;
}

export async function buscarVehiculoPorPatente(patente) {
    const pool = await obtenerPool();
    const resultado = await pool
        .request()
        .input("Patente", sql.VarChar(10), patente)
        .execute("sp_Vehiculos_BuscarPorPatente");
    return resultado.recordset[0];
}

export async function crearTurno({ patente, fecha, hora, servicios, cliente = {}, vehiculo = {} }) {
    const pool = await obtenerPool();
    const resultado = await pool
        .request()
        .input("Patente", sql.VarChar(10), patente)
        .input("Fecha", sql.VarChar(10), fecha)
        .input("Hora", sql.VarChar(8), hora)
        .input("Servicios", sql.NVarChar(sql.MAX), JSON.stringify(servicios))
        .input("Nombre", sql.VarChar(100), cliente.nombre)
        .input("Apellido", sql.VarChar(100), cliente.apellido)
        .input("Telefono", sql.VarChar(20), cliente.telefono)
        .input("Email", sql.VarChar(100), cliente.email)
        .input("Marca", sql.VarChar(50), vehiculo.marca)
        .input("Modelo", sql.VarChar(50), vehiculo.modelo)
        .input("TipoVehiculo", sql.VarChar(30), vehiculo.tipoVehiculo)
        .execute("sp_Turnos_Crear");
    return resultado.recordset[0];
}
