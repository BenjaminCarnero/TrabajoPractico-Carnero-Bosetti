import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { obtenerPool } from "./config/db.js";
import { manejarErrores, rutaNoEncontrada } from "./middlewares/errores.js";
import rutas from "./routes/index.js";

const carpetaFront = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "front");
const puerto = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use("/api", rutas);
app.use("/api", rutaNoEncontrada);
app.use(express.static(carpetaFront));
app.use(manejarErrores);

try {
    await obtenerPool();
    console.log("Conectado a SQL Server.");
} catch (error) {
    console.error("No se pudo conectar a SQL Server:", error.message);
    process.exit(1);
}

app.listen(puerto, () => {
    console.log(`Servidor en http://localhost:${puerto}`);
});
