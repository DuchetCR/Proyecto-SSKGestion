const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const {
    iniciarPool,
    obtenerConexion,
    cerrarPool
} = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
 * La carpeta SSK_GUI está fuera de backend.
 *
 * Proyecto-SSKGestion
 * ├── backend
 * │   └── server.js
 * └── SSK_GUI
 */
const frontendPath = path.join(__dirname, "../SSK_GUI");

/*
 * Permite que Express muestre los archivos HTML, CSS,
 * JavaScript, imágenes y demás recursos del frontend.
 */
app.use(express.static(frontendPath));

/*
 * Al abrir http://localhost:3000
 * se mostrará la pantalla de inicio de sesión.
 */
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "login.html"));
});

/*
 * Ruta para comprobar que Oracle Cloud sigue funcionando.
 */
app.get("/api/prueba-oracle", async (req, res) => {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado = await conexion.execute(`
            SELECT
                USER AS usuario,
                SYS_CONTEXT('USERENV', 'SERVICE_NAME') AS servicio,
                SYSDATE AS fecha_servidor
            FROM DUAL
        `);

        res.status(200).json({
            correcto: true,
            mensaje: "Conexión con Oracle Cloud funcionando.",
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error("Error en la prueba de Oracle:", error);

        res.status(500).json({
            correcto: false,
            mensaje: "No fue posible consultar Oracle Cloud.",
            error: error.message
        });
    } finally {
        if (conexion) {
            try {
                await conexion.close();
            } catch (errorCierre) {
                console.error(
                    "Error al devolver la conexión al pool:",
                    errorCierre.message
                );
            }
        }
    }
});

const PORT = Number(process.env.PORT) || 3000;

async function iniciarServidor() {
    try {
        await iniciarPool();

        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
            console.log(`Frontend disponible en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(
            "El servidor no pudo iniciar porque Oracle no está disponible."
        );
        console.error(error.message);
        process.exit(1);
    }
}

async function apagarServidor(signal) {
    console.log(`\nSe recibió ${signal}. Cerrando el servidor...`);

    await cerrarPool();

    process.exit(0);
}

process.on("SIGINT", () => apagarServidor("SIGINT"));
process.on("SIGTERM", () => apagarServidor("SIGTERM"));

iniciarServidor();