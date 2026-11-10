import { obtenerPool, sql } from "../config/db.js";

export async function obtenerResumen() {
    const pool = await obtenerPool();

    const resultado = await pool.request()
        .execute("dbo.sp_ResumenTablero");

    return resultado.recordset;
}
export async function obtenerListadoTurnos() {
    const pool = await obtenerPool();
    const resultado = await pool.request()
        .execute("dbo.sp_ListadoTurnos");

    return resultado.recordset;
}

export async function cambiarEstadoTurno(idTurno, estado) {
    const pool = await obtenerPool();

    await pool.request()
        .input("ID_Turno", sql.Int, idTurno)
        .input("Estado", sql.VarChar(20), estado)
        .execute("dbo.sp_CambiarEstadoTurno");
}

export async function obtenerTurnosPorEstado() {
    const pool = await obtenerPool();
    const resultado = await pool.request()
        .execute("dbo.sp_TurnosPorEstado");

    return resultado.recordset;
}

export async function obtenerServiciosMasSolicitados() {
    const pool = await obtenerPool();
    const resultado = await pool.request()
        .execute("dbo.sp_ServiciosMasSolicitados");

    return resultado.recordset;
}
