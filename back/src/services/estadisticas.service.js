import { obtenerPool } from "../config/db.js";

export async function obtenerResumen() {
    const pool = await obtenerPool();

    const resultado = await pool.request()
        .execute("dbo.sp_ResumenTablero");

    return resultado.recordset;
}