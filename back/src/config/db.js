// Única conexión a SQL Server: los services piden el pool con obtenerPool().
import sql from "mssql";

const configuracion = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        // SQL Server Express local: sin certificado válido ni cifrado.
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool = null;

export async function obtenerPool() {
    if (!pool) {
        pool = await new sql.ConnectionPool(configuracion).connect();
    }
    return pool;
}

export { sql };
