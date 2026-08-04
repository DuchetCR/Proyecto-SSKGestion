const express = require("express");
const router = express.Router();

const facturaController = require(
    "../controllers/facturaController"
);


router.get(
    "/",
    facturaController.listarFacturas
);


router.get(
    "/pagos",
    facturaController.listarPagosParaFactura
);


router.get(
    "/resumen",
    facturaController.obtenerResumenFacturas
);


router.post(
    "/",
    facturaController.guardarFactura
);


router.put(
    "/:id",
    facturaController.editarFactura
);


router.delete(
    "/:id",
    facturaController.eliminarFactura
);


module.exports = router;