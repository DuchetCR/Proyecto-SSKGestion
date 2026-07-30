const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const usuariosRoutes = require("./routes/usuarios");

const {
    iniciarPool,
    obtenerConexion,
    cerrarPool
} = require("./config/db");

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/usuarios", usuariosRoutes);


const frontendPath = path.join(__dirname, "../SSK_GUI");


app.use(express.static(frontendPath));


app.get("/", (req, res) => {
    res.sendFile(
        path.join(frontendPath, "login.html")
    );
});


app.get("/api/prueba-oracle", async (req, res) => {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado = await conexion.execute(`
            SELECT
                USER AS usuario,
                SYS_CONTEXT(
                    'USERENV',
                    'SERVICE_NAME'
                ) AS servicio,
                SYSDATE AS fecha_servidor
            FROM DUAL
        `);

        return res.status(200).json({
            correcto: true,
            mensaje:
                "Conexión con Oracle Cloud funcionando.",
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error(
            "Error en la prueba de Oracle:",
            error
        );

        return res.status(500).json({
            correcto: false,
            mensaje:
                "No fue posible consultar Oracle Cloud.",
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
            console.log(
                `Servidor ejecutándose en http://localhost:${PORT}`
            );

            console.log(
                `Frontend disponible en http://localhost:${PORT}`
            );
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
    console.log(
        `\nSe recibió ${signal}. Cerrando el servidor...`
    );

    try {
        await cerrarPool();
    } catch (error) {
        console.error(
            "Error cerrando Oracle:",
            error.message
        );
    } finally {
        process.exit(0);
    }
}

process.on("SIGINT", () =>
    apagarServidor("SIGINT")
);

process.on("SIGTERM", () =>
    apagarServidor("SIGTERM")
);

iniciarServidor();