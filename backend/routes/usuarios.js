const express = require("express");
const router = express.Router();

const usuarioController = require(
    "../controllers/usuarioController"
);

router.get(
    "/",
    usuarioController.listarUsuarios
);

router.post(
    "/",
    usuarioController.guardarUsuario
);

router.put(
    "/:id",
    usuarioController.editarUsuario
);

router.delete(
    "/:id",
    usuarioController.eliminarUsuario
);

module.exports = router;