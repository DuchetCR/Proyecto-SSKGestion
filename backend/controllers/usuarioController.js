const { obtenerConexion } = require("../config/db");

async function guardarUsuario(req, res) {
    let conexion;

    try {
        console.log("Datos recibidos:", req.body);

        const {
            nombre,
            primerApellido,
            segundoApellido,
            tipoUsuario,
            puesto,
            salario,
            correo,
            telefono
        } = req.body;

        if (
            !nombre ||
            !primerApellido ||
            !tipoUsuario ||
            !correo ||
            !telefono
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje: "Complete todos los campos obligatorios."
            });
        }

        const idTipoUsuario = Number(tipoUsuario);

        const idPuesto =
            idTipoUsuario === 4 && puesto
                ? Number(puesto)
                : null;

        const salarioUsuario =
            idTipoUsuario === 4 &&
            salario !== "" &&
            salario !== null &&
            salario !== undefined
                ? Number(salario)
                : null;

        if (
            !Number.isInteger(idTipoUsuario) ||
            idTipoUsuario < 1 ||
            idTipoUsuario > 4
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje: "El tipo de usuario no es válido."
            });
        }

        if (
            idTipoUsuario === 4 &&
            (!idPuesto || salarioUsuario === null)
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje: "El empleado debe tener puesto y salario."
            });
        }

        conexion = await obtenerConexion();

        const resultadoId = await conexion.execute(`
            SELECT NVL(MAX(id_usuario), 0) + 1 AS "nuevoId"
            FROM USUARIO
        `);

        const nuevoId = resultadoId.rows[0].nuevoId;

        console.log("Nuevo ID generado:", nuevoId);

        await conexion.execute(
            `
            INSERT INTO USUARIO (
                id_usuario,
                id_tipo_usuario,
                id_estado,
                id_puesto,
                nombre,
                primer_apellido,
                segundo_apellido,
                salario
            )
            VALUES (
                :idUsuario,
                :idTipoUsuario,
                :idEstado,
                :idPuesto,
                :nombre,
                :primerApellido,
                :segundoApellido,
                :salario
            )
            `,
            {
                idUsuario: nuevoId,
                idTipoUsuario: idTipoUsuario,
                idEstado: 1,
                idPuesto: idPuesto,
                nombre: nombre.trim(),
                primerApellido: primerApellido.trim(),
                segundoApellido: segundoApellido
                    ? segundoApellido.trim()
                    : null,
                salario: salarioUsuario
            },
            {
                autoCommit: false
            }
        );

        console.log("Usuario insertado.");

        await conexion.execute(
            `
            INSERT INTO CORREO (
                id_usuario,
                id_estado,
                correo
            )
            VALUES (
                :idUsuario,
                :idEstado,
                :correo
            )
            `,
            {
                idUsuario: nuevoId,
                idEstado: 1,
                correo: correo.trim().toLowerCase()
            },
            {
                autoCommit: false
            }
        );

        console.log("Correo insertado.");

        await conexion.execute(
            `
            INSERT INTO TELEFONO (
                id_usuario,
                id_estado,
                telefono
            )
            VALUES (
                :idUsuario,
                :idEstado,
                :telefono
            )
            `,
            {
                idUsuario: nuevoId,
                idEstado: 1,
                telefono: telefono.trim()
            },
            {
                autoCommit: false
            }
        );

        console.log("Teléfono insertado.");

        await conexion.commit();

        return res.status(201).json({
            correcto: true,
            mensaje: "Usuario guardado correctamente.",
            usuario: {
                idUsuario: nuevoId,
                nombre: nombre.trim(),
                primerApellido: primerApellido.trim(),
                segundoApellido: segundoApellido
                    ? segundoApellido.trim()
                    : "",
                tipoUsuario: idTipoUsuario,
                puesto: idPuesto,
                salario: salarioUsuario,
                correo: correo.trim().toLowerCase(),
                telefono: telefono.trim()
            }
        });
    } catch (error) {
        console.error("ERROR COMPLETO AL GUARDAR:");
        console.error(error);

        if (conexion) {
            try {
                await conexion.rollback();
            } catch (errorRollback) {
                console.error(
                    "Error durante rollback:",
                    errorRollback
                );
            }
        }

        return res.status(500).json({
            correcto: false,
            mensaje: "No se pudo agregar el usuario.",
            error: error.message,
            codigoOracle: error.errorNum || null
        });
    } finally {
        if (conexion) {
            try {
                await conexion.close();
            } catch (errorCierre) {
                console.error(
                    "Error cerrando la conexión:",
                    errorCierre
                );
            }
        }
    }
}

async function listarUsuarios(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado = await conexion.execute(`
            SELECT
                U.ID_USUARIO AS "idUsuario",
                U.NOMBRE AS "nombre",
                U.PRIMER_APELLIDO AS "primerApellido",
                U.SEGUNDO_APELLIDO AS "segundoApellido",
                U.ID_TIPO_USUARIO AS "tipoUsuario",
                U.ID_PUESTO AS "puesto",
                U.SALARIO AS "salario",
                C.CORREO AS "correo",
                T.TELEFONO AS "telefono"
            FROM USUARIO U
            LEFT JOIN CORREO C
                ON C.ID_USUARIO = U.ID_USUARIO
                AND C.ID_ESTADO = 1
            LEFT JOIN TELEFONO T
                ON T.ID_USUARIO = U.ID_USUARIO
                AND T.ID_ESTADO = 1
            WHERE U.ID_ESTADO = 1
            ORDER BY U.ID_USUARIO
        `);

        return res.status(200).json({
            correcto: true,
            usuarios: resultado.rows
        });
    } catch (error) {
        console.error("Error al listar usuarios:", error);

        return res.status(500).json({
            correcto: false,
            mensaje: "No se pudieron cargar los usuarios.",
            error: error.message
        });
    } finally {
        if (conexion) {
            try {
                await conexion.close();
            } catch (errorCierre) {
                console.error(
                    "Error cerrando la conexión:",
                    errorCierre.message
                );
            }
        }
    }
}

async function eliminarUsuario(req, res) {
    let conexion;

    try {
        const idUsuario = Number(req.params.id);

        if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
            return res.status(400).json({
                correcto: false,
                mensaje: "El identificador del usuario no es válido."
            });
        }

        conexion = await obtenerConexion();

        const resultado = await conexion.execute(
            `
                UPDATE USUARIO
                SET ID_ESTADO = :idEstado
                WHERE ID_USUARIO = :idUsuario
                  AND ID_ESTADO <> :idEstado
            `,
            {
                idEstado: 2,
                idUsuario: idUsuario
            }
        );

        if (resultado.rowsAffected === 0) {
            await conexion.rollback();

            return res.status(404).json({
                correcto: false,
                mensaje: "El usuario no existe o ya está inactivo."
            });
        }

        await conexion.commit();

        return res.status(200).json({
            correcto: true,
            mensaje: "Usuario marcado como inactivo correctamente.",
            idUsuario: idUsuario
        });
    } catch (error) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (errorRollback) {
                console.error(
                    "Error al revertir la eliminación:",
                    errorRollback.message
                );
            }
        }

        console.error("Error al inactivar el usuario:", error);

        return res.status(500).json({
            correcto: false,
            mensaje: "No se pudo eliminar el usuario.",
            error: error.message
        });
    } finally {
        if (conexion) {
            try {
                await conexion.close();
            } catch (errorCierre) {
                console.error(
                    "Error al cerrar la conexión:",
                    errorCierre.message
                );
            }
        }
    }

}

async function editarUsuario(req, res) {
    let conexion;

    try {
        const idUsuario = Number(req.params.id);

        const {
            nombre,
            primerApellido,
            segundoApellido,
            tipoUsuario,
            puesto,
            salario,
            correo,
            telefono
        } = req.body;

        if (
            !Number.isInteger(idUsuario) ||
            idUsuario <= 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje: "El identificador no es válido."
            });
        }

        if (
            !nombre ||
            !primerApellido ||
            !tipoUsuario ||
            !correo ||
            !telefono
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje: "Complete todos los campos obligatorios."
            });
        }

        const idTipoUsuario = Number(tipoUsuario);

        const idPuesto =
            idTipoUsuario === 4 && puesto
                ? Number(puesto)
                : null;

        const salarioUsuario =
            idTipoUsuario === 4 &&
            salario !== "" &&
            salario !== null &&
            salario !== undefined
                ? Number(salario)
                : null;

        if (
            !Number.isInteger(idTipoUsuario) ||
            idTipoUsuario < 1 ||
            idTipoUsuario > 4
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje: "El tipo de usuario no es válido."
            });
        }

        if (
            idTipoUsuario === 4 &&
            (!idPuesto || salarioUsuario === null)
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje: "El empleado debe tener puesto y salario."
            });
        }

        conexion = await obtenerConexion();

        const resultadoUsuario = await conexion.execute(
            `
            UPDATE USUARIO
            SET
                ID_TIPO_USUARIO = :idTipoUsuario,
                ID_PUESTO = :idPuesto,
                NOMBRE = :nombre,
                PRIMER_APELLIDO = :primerApellido,
                SEGUNDO_APELLIDO = :segundoApellido,
                SALARIO = :salario
            WHERE ID_USUARIO = :idUsuario
              AND ID_ESTADO = 1
            `,
            {
                idTipoUsuario,
                idPuesto,
                nombre: nombre.trim(),
                primerApellido: primerApellido.trim(),
                segundoApellido: segundoApellido
                    ? segundoApellido.trim()
                    : null,
                salario: salarioUsuario,
                idUsuario
            },
            {
                autoCommit: false
            }
        );

        if (resultadoUsuario.rowsAffected === 0) {
            await conexion.rollback();

            return res.status(404).json({
                correcto: false,
                mensaje: "El usuario no existe o está inactivo."
            });
        }

        const resultadoCorreo = await conexion.execute(
            `
            UPDATE CORREO
            SET CORREO = :correo
            WHERE ID_USUARIO = :idUsuario
              AND ID_ESTADO = 1
            `,
            {
                correo: correo.trim().toLowerCase(),
                idUsuario
            },
            {
                autoCommit: false
            }
        );

        if (resultadoCorreo.rowsAffected === 0) {
            await conexion.execute(
                `
                INSERT INTO CORREO (
                    ID_USUARIO,
                    ID_ESTADO,
                    CORREO
                )
                VALUES (
                    :idUsuario,
                    1,
                    :correo
                )
                `,
                {
                    idUsuario,
                    correo: correo.trim().toLowerCase()
                },
                {
                    autoCommit: false
                }
            );
        }

        const resultadoTelefono = await conexion.execute(
            `
            UPDATE TELEFONO
            SET TELEFONO = :telefono
            WHERE ID_USUARIO = :idUsuario
              AND ID_ESTADO = 1
            `,
            {
                telefono: telefono.trim(),
                idUsuario
            },
            {
                autoCommit: false
            }
        );

        if (resultadoTelefono.rowsAffected === 0) {
            await conexion.execute(
                `
                INSERT INTO TELEFONO (
                    ID_USUARIO,
                    ID_ESTADO,
                    TELEFONO
                )
                VALUES (
                    :idUsuario,
                    1,
                    :telefono
                )
                `,
                {
                    idUsuario,
                    telefono: telefono.trim()
                },
                {
                    autoCommit: false
                }
            );
        }

        await conexion.commit();

        return res.status(200).json({
            correcto: true,
            mensaje: "Usuario actualizado correctamente.",
            usuario: {
                idUsuario,
                nombre: nombre.trim(),
                primerApellido: primerApellido.trim(),
                segundoApellido: segundoApellido
                    ? segundoApellido.trim()
                    : "",
                tipoUsuario: idTipoUsuario,
                puesto: idPuesto,
                salario: salarioUsuario,
                correo: correo.trim().toLowerCase(),
                telefono: telefono.trim()
            }
        });
    } catch (error) {
        console.error(
            "Error al editar el usuario:",
            error
        );

        if (conexion) {
            try {
                await conexion.rollback();
            } catch (errorRollback) {
                console.error(
                    "Error durante rollback:",
                    errorRollback.message
                );
            }
        }

        return res.status(500).json({
            correcto: false,
            mensaje: "No se pudo actualizar el usuario.",
            error: error.message
        });
    } finally {
        if (conexion) {
            try {
                await conexion.close();
            } catch (errorCierre) {
                console.error(
                    "Error cerrando la conexión:",
                    errorCierre.message
                );
            }
        }
    }
}

module.exports = {
        guardarUsuario,
        listarUsuarios,
        editarUsuario,
        eliminarUsuario
    };