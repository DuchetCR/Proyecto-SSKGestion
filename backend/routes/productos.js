const express = require("express");
const router = express.Router();

const productoController = require(
    "../controllers/productoController"
);


router.get(
    "/",
    productoController.listarProductos
);


router.post(
    "/",
    productoController.guardarProducto
);


router.put(
    "/:id",
    productoController.editarProducto
);


module.exports = router;