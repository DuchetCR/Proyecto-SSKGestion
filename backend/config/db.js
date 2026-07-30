const oracledb = require("oracledb");
const path = require("path");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = false;

const walletPath = path.resolve(__dirname, "../wallet");

async function iniciarPool() {
    try {
        const pool = await oracledb.createPool({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTION,

            configDir: walletPath,
            walletLocation: walletPath,
            walletPassword: process.env.WALLET_PASSWORD,

            poolMin: 1,
            poolMax: 5,
            poolIncrement: 1
        });

        console.log("Conexión con Oracle Cloud establecida correctamente.");

        return pool;
    } catch (error) {
        console.error("No se pudo crear el pool de Oracle.");
        console.error(error.message);

        throw error;
    }
}

async function obtenerConexion() {
    try {
        return await oracledb.getConnection();
    } catch (error) {
        console.error("No se pudo obtener una conexión del pool.");
        throw error;
    }
}

async function cerrarPool() {
    try {
        const pool = oracledb.getPool();

        await pool.close(10);

        console.log("Pool de Oracle cerrado correctamente.");
    } catch (error) {
        if (error.errorNum !== 24422) {
            console.error("Error al cerrar el pool de Oracle:", error.message);
        }
    }
}

module.exports = {
    iniciarPool,
    obtenerConexion,
    cerrarPool
};