const express = require("express");
const router = express.Router();

const pagoController = require(
    "../controllers/pagoController"
);


router.get(
    "/",
    pagoController.listarPagos
);


router.get(
    "/pedidos",
    pagoController.listarPedidosPago
);


router.get(
    "/metodos",
    pagoController.listarMetodosPago
);


router.get(
    "/resumen",
    pagoController.obtenerResumenPagos
);


router.post(
    "/",
    pagoController.guardarPago
);


router.put(
    "/:id",
    pagoController.editarPago
);


router.delete(
    "/:id",
    pagoController.eliminarPago
);


module.exports = router;