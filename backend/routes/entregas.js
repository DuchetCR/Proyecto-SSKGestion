const express = require("express");
const router = express.Router();

const entregaController = require(
    "../controllers/entregaController"
);


router.get(
    "/",
    entregaController.listarEntregas
);


router.get(
    "/pedidos",
    entregaController.listarPedidosEntrega
);


router.get(
    "/repartidores",
    entregaController.listarRepartidores
);


router.post(
    "/",
    entregaController.guardarEntrega
);


router.put(
    "/:id",
    entregaController.editarEntrega
);


router.delete(
    "/:id",
    entregaController.eliminarEntrega
);


module.exports = router;