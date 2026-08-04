const express = require("express");
const router = express.Router();

const pedidoController = require(
    "../controllers/pedidoController"
);


router.get(
    "/",
    pedidoController.listarPedidos
);


router.get(
    "/clientes",
    pedidoController.listarClientes
);


router.get(
    "/productos",
    pedidoController.listarProductosPedido
);


router.post(
    "/",
    pedidoController.guardarPedido
);


router.put(
    "/:id",
    pedidoController.editarPedido
);


router.delete(
    "/:id",
    pedidoController.eliminarPedido
);


module.exports = router;