const { obtenerConexion } = require("../config/db");


function validarEntrega(datos) {
    const idDetallePedido = Number(
        datos.idDetallePedido
    );

    const idRepartidor = Number(
        datos.idRepartidor
    );

    const idEstado = Number(
        datos.idEstado
    );

    const fechaEntrega = datos.fechaEntrega
        ? String(datos.fechaEntrega).trim()
        : "";

    if (
        !Number.isInteger(idDetallePedido) ||
        idDetallePedido <= 0
    ) {
        return {
            error:
                "Debe seleccionar un pedido válido."
        };
    }

    if (
        !Number.isInteger(idRepartidor) ||
        idRepartidor <= 0
    ) {
        return {
            error:
                "Debe seleccionar un repartidor válido."
        };
    }

    if (!fechaEntrega) {
        return {
            error:
                "Debe seleccionar la fecha de entrega."
        };
    }

    
    if (
        !Number.isInteger(idEstado) ||
        ![3, 4, 5].includes(idEstado)
    ) {
        return {
            error:
                "Debe seleccionar un estado válido."
        };
    }

    return {
        entrega: {
            idDetallePedido,
            idRepartidor,
            idEstado,
            fechaEntrega
        }
    };
}


async function listarEntregas(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    E.ID_ENTREGA
                        AS "idEntrega",

                    E.ID_DETALLE_PEDIDO
                        AS "idDetallePedido",

                    DP.ID_PEDIDO
                        AS "idPedido",

                    E.ID_USUARIO
                        AS "idRepartidor",

                    PE.ID_USUARIO
                        AS "idCliente",

                    TRIM(
                        NVL(CL.NOMBRE, '') || ' ' ||
                        NVL(CL.PRIMER_APELLIDO, '') || ' ' ||
                        NVL(CL.SEGUNDO_APELLIDO, '')
                    ) AS "cliente",

                    TRIM(
                        NVL(RE.NOMBRE, '') || ' ' ||
                        NVL(RE.PRIMER_APELLIDO, '') || ' ' ||
                        NVL(RE.SEGUNDO_APELLIDO, '')
                    ) AS "repartidor",

                    PR.NOMBRE
                        AS "producto",

                    DIR.OTRAS_SENAS
                        AS "otrasSenas",

                    DIS.NOMBRE_DISTRITO
                        AS "distrito",

                    CAN.NOMBRE_CANTON
                        AS "canton",

                    PRO.NOMBRE_PROVINCIA
                        AS "provincia",

                    TRIM(
                        NVL(DIR.OTRAS_SENAS, '') ||
                        CASE
                            WHEN DIS.NOMBRE_DISTRITO
                                 IS NOT NULL
                            THEN ', ' ||
                                 DIS.NOMBRE_DISTRITO
                            ELSE ''
                        END ||
                        CASE
                            WHEN CAN.NOMBRE_CANTON
                                 IS NOT NULL
                            THEN ', ' ||
                                 CAN.NOMBRE_CANTON
                            ELSE ''
                        END ||
                        CASE
                            WHEN PRO.NOMBRE_PROVINCIA
                                 IS NOT NULL
                            THEN ', ' ||
                                 PRO.NOMBRE_PROVINCIA
                            ELSE ''
                        END
                    ) AS "direccion",

                    TO_CHAR(
                        E.FECHA_ENTREGA,
                        'YYYY-MM-DD'
                    ) AS "fechaEntrega",

                    E.ID_ESTADO
                        AS "idEstado",

                    ES.ESTADO
                        AS "estado"

                FROM ENTREGA E

                INNER JOIN DETALLE_PEDIDO DP
                    ON DP.ID_DETALLE_PEDIDO =
                       E.ID_DETALLE_PEDIDO

                INNER JOIN PEDIDO PE
                    ON PE.ID_PEDIDO =
                       DP.ID_PEDIDO

                INNER JOIN PRODUCTO PR
                    ON PR.ID_PRODUCTO =
                       DP.ID_PRODUCTO

                INNER JOIN USUARIO CL
                    ON CL.ID_USUARIO =
                       PE.ID_USUARIO

                INNER JOIN USUARIO RE
                    ON RE.ID_USUARIO =
                       E.ID_USUARIO

                INNER JOIN DIRECCION DIR
                    ON DIR.ID_USUARIO =
                       E.ID_DIRECCION

                LEFT JOIN DISTRITO DIS
                    ON DIS.ID_DISTRITO =
                       DIR.ID_DISTRITO

                LEFT JOIN CANTON CAN
                    ON CAN.ID_CANTON =
                       DIS.ID_CANTON

                LEFT JOIN PROVINCIA PRO
                    ON PRO.ID_PROVINCIA =
                       CAN.ID_PROVINCIA

                INNER JOIN ESTADO ES
                    ON ES.ID_ESTADO =
                       E.ID_ESTADO

                WHERE E.ID_ESTADO <> 6

                ORDER BY E.ID_ENTREGA
            `);

        return res.status(200).json({
            correcto: true,
            entregas: resultado.rows
        });
    } catch (error) {
        console.error(
            "Error al listar entregas:",
            error
        );

        return res.status(500).json({
            correcto: false,
            mensaje:
                "No se pudieron cargar las entregas.",
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


async function listarPedidosEntrega(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    DP.ID_DETALLE_PEDIDO
                        AS "idDetallePedido",

                    PE.ID_PEDIDO
                        AS "idPedido",

                    PE.ID_USUARIO
                        AS "idCliente",

                    TRIM(
                        NVL(U.NOMBRE, '') || ' ' ||
                        NVL(U.PRIMER_APELLIDO, '') || ' ' ||
                        NVL(U.SEGUNDO_APELLIDO, '')
                    ) AS "cliente",

                    PR.NOMBRE
                        AS "producto",

                    PE.CANTIDAD
                        AS "cantidad",

                    DIR.OTRAS_SENAS
                        AS "otrasSenas",

                    DIS.NOMBRE_DISTRITO
                        AS "distrito",

                    CAN.NOMBRE_CANTON
                        AS "canton",

                    PRO.NOMBRE_PROVINCIA
                        AS "provincia",

                    TRIM(
                        NVL(DIR.OTRAS_SENAS, '') ||
                        CASE
                            WHEN DIS.NOMBRE_DISTRITO
                                 IS NOT NULL
                            THEN ', ' ||
                                 DIS.NOMBRE_DISTRITO
                            ELSE ''
                        END ||
                        CASE
                            WHEN CAN.NOMBRE_CANTON
                                 IS NOT NULL
                            THEN ', ' ||
                                 CAN.NOMBRE_CANTON
                            ELSE ''
                        END ||
                        CASE
                            WHEN PRO.NOMBRE_PROVINCIA
                                 IS NOT NULL
                            THEN ', ' ||
                                 PRO.NOMBRE_PROVINCIA
                            ELSE ''
                        END
                    ) AS "direccion"

                FROM DETALLE_PEDIDO DP

                INNER JOIN PEDIDO PE
                    ON PE.ID_PEDIDO =
                       DP.ID_PEDIDO

                INNER JOIN PRODUCTO PR
                    ON PR.ID_PRODUCTO =
                       DP.ID_PRODUCTO

                INNER JOIN USUARIO U
                    ON U.ID_USUARIO =
                       PE.ID_USUARIO

                INNER JOIN DIRECCION DIR
                    ON DIR.ID_USUARIO =
                       PE.ID_USUARIO

                LEFT JOIN DISTRITO DIS
                    ON DIS.ID_DISTRITO =
                       DIR.ID_DISTRITO

                LEFT JOIN CANTON CAN
                    ON CAN.ID_CANTON =
                       DIS.ID_CANTON

                LEFT JOIN PROVINCIA PRO
                    ON PRO.ID_PROVINCIA =
                       CAN.ID_PROVINCIA

                WHERE PE.ID_ESTADO <> 6
                  AND DP.ID_ESTADO <> 6
                  AND DIR.ID_ESTADO = 1

                ORDER BY PE.ID_PEDIDO
            `);

        return res.status(200).json({
            correcto: true,
            pedidos: resultado.rows
        });
    } catch (error) {
        console.error(
            "Error al listar pedidos para entrega:",
            error
        );

        return res.status(500).json({
            correcto: false,
            mensaje:
                "No se pudieron cargar los pedidos.",
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


async function listarRepartidores(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    U.ID_USUARIO
                        AS "idRepartidor",

                    TRIM(
                        NVL(U.NOMBRE, '') || ' ' ||
                        NVL(U.PRIMER_APELLIDO, '') || ' ' ||
                        NVL(U.SEGUNDO_APELLIDO, '')
                    ) AS "nombreCompleto"

                FROM USUARIO U

                WHERE U.ID_ESTADO = 1
                  AND U.ID_TIPO_USUARIO = 4
                  AND U.ID_PUESTO = 3

                ORDER BY U.NOMBRE
            `);

        return res.status(200).json({
            correcto: true,
            repartidores: resultado.rows
        });
    } catch (error) {
        console.error(
            "Error al listar repartidores:",
            error
        );

        return res.status(500).json({
            correcto: false,
            mensaje:
                "No se pudieron cargar los repartidores.",
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


async function guardarEntrega(req, res) {
    let conexion;

    try {
        console.log(
            "Datos de entrega recibidos:",
            req.body
        );

        const validacion = validarEntrega(
            req.body
        );

        if (validacion.error) {
            return res.status(400).json({
                correcto: false,
                mensaje: validacion.error
            });
        }

        const {
            idDetallePedido,
            idRepartidor,
            idEstado,
            fechaEntrega
        } = validacion.entrega;

        conexion = await obtenerConexion();

        
        const resultadoPedido =
            await conexion.execute(
                `
                SELECT
                    PE.ID_PEDIDO
                        AS "idPedido",

                    PE.ID_USUARIO
                        AS "idCliente"

                FROM DETALLE_PEDIDO DP

                INNER JOIN PEDIDO PE
                    ON PE.ID_PEDIDO =
                       DP.ID_PEDIDO

                INNER JOIN DIRECCION DIR
                    ON DIR.ID_USUARIO =
                       PE.ID_USUARIO

                WHERE DP.ID_DETALLE_PEDIDO =
                      :idDetallePedido

                  AND DP.ID_ESTADO <> 6
                  AND PE.ID_ESTADO <> 6
                  AND DIR.ID_ESTADO = 1
                `,
                {
                    idDetallePedido
                }
            );

        if (
            resultadoPedido.rows.length === 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El pedido seleccionado no existe, fue eliminado o no tiene dirección."
            });
        }

       
        const idDireccion =
            Number(
                resultadoPedido.rows[0]
                    .idCliente
            );

        
        const resultadoRepartidor =
            await conexion.execute(
                `
                SELECT COUNT(*) AS "cantidad"
                FROM USUARIO

                WHERE ID_USUARIO =
                      :idRepartidor

                  AND ID_ESTADO = 1
                  AND ID_TIPO_USUARIO = 4
                  AND ID_PUESTO = 3
                `,
                {
                    idRepartidor
                }
            );

        if (
            Number(
                resultadoRepartidor.rows[0]
                    .cantidad
            ) === 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El repartidor seleccionado no existe o está inactivo."
            });
        }

        
        const resultadoExistente =
            await conexion.execute(
                `
                SELECT COUNT(*) AS "cantidad"
                FROM ENTREGA

                WHERE ID_DETALLE_PEDIDO =
                      :idDetallePedido

                  AND ID_ESTADO <> 6
                `,
                {
                    idDetallePedido
                }
            );

        if (
            Number(
                resultadoExistente.rows[0]
                    .cantidad
            ) > 0
        ) {
            return res.status(409).json({
                correcto: false,
                mensaje:
                    "El pedido seleccionado ya tiene una entrega registrada."
            });
        }

        const resultadoId =
            await conexion.execute(`
                SELECT
                    NVL(
                        MAX(ID_ENTREGA),
                        0
                    ) + 1 AS "idEntrega"

                FROM ENTREGA
            `);

        const idEntrega =
            resultadoId.rows[0].idEntrega;

        await conexion.execute(
            `
            INSERT INTO ENTREGA (
                ID_ENTREGA,
                ID_DIRECCION,
                ID_USUARIO,
                ID_DETALLE_PEDIDO,
                ID_ESTADO,
                FECHA_ENTREGA
            )
            VALUES (
                :idEntrega,
                :idDireccion,
                :idRepartidor,
                :idDetallePedido,
                :idEstado,
                TO_DATE(
                    :fechaEntrega,
                    'YYYY-MM-DD'
                )
            )
            `,
            {
                idEntrega,
                idDireccion,
                idRepartidor,
                idDetallePedido,
                idEstado,
                fechaEntrega
            },
            {
                autoCommit: false
            }
        );

        await conexion.commit();

        return res.status(201).json({
            correcto: true,
            mensaje:
                "Entrega guardada correctamente.",
            entrega: {
                idEntrega,
                idDireccion,
                idRepartidor,
                idDetallePedido,
                idEstado,
                fechaEntrega
            }
        });
    } catch (error) {
        console.error(
            "Error al guardar entrega:",
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
            mensaje:
                "No se pudo guardar la entrega.",
            error: error.message,
            codigoOracle:
                error.errorNum || null
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



async function editarEntrega(req, res) {
    let conexion;

    try {
        const idEntrega = Number(
            req.params.id
        );

        if (
            !Number.isInteger(idEntrega) ||
            idEntrega <= 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El identificador de la entrega no es válido."
            });
        }

        const validacion = validarEntrega(
            req.body
        );

        if (validacion.error) {
            return res.status(400).json({
                correcto: false,
                mensaje: validacion.error
            });
        }

        const {
            idDetallePedido,
            idRepartidor,
            idEstado,
            fechaEntrega
        } = validacion.entrega;

        conexion = await obtenerConexion();

        
        const resultadoPedido =
            await conexion.execute(
                `
                SELECT
                    PE.ID_USUARIO
                        AS "idCliente"

                FROM DETALLE_PEDIDO DP

                INNER JOIN PEDIDO PE
                    ON PE.ID_PEDIDO =
                       DP.ID_PEDIDO

                INNER JOIN DIRECCION DIR
                    ON DIR.ID_USUARIO =
                       PE.ID_USUARIO

                WHERE DP.ID_DETALLE_PEDIDO =
                      :idDetallePedido

                  AND DP.ID_ESTADO <> 6
                  AND PE.ID_ESTADO <> 6
                  AND DIR.ID_ESTADO = 1
                `,
                {
                    idDetallePedido
                }
            );

        if (
            resultadoPedido.rows.length === 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El pedido seleccionado no existe o no tiene dirección."
            });
        }

        const idDireccion =
            Number(
                resultadoPedido.rows[0]
                    .idCliente
            );

        
        const resultadoRepartidor =
            await conexion.execute(
                `
                SELECT COUNT(*) AS "cantidad"
                FROM USUARIO

                WHERE ID_USUARIO =
                      :idRepartidor

                  AND ID_ESTADO = 1
                  AND ID_TIPO_USUARIO = 4
                  AND ID_PUESTO = 3
                `,
                {
                    idRepartidor
                }
            );

        if (
            Number(
                resultadoRepartidor.rows[0]
                    .cantidad
            ) === 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El repartidor seleccionado no existe o está inactivo."
            });
        }

        
        const resultadoDuplicado =
            await conexion.execute(
                `
                SELECT COUNT(*) AS "cantidad"
                FROM ENTREGA

                WHERE ID_DETALLE_PEDIDO =
                      :idDetallePedido

                  AND ID_ENTREGA <>
                      :idEntrega

                  AND ID_ESTADO <> 6
                `,
                {
                    idDetallePedido,
                    idEntrega
                }
            );

        if (
            Number(
                resultadoDuplicado.rows[0]
                    .cantidad
            ) > 0
        ) {
            return res.status(409).json({
                correcto: false,
                mensaje:
                    "El pedido seleccionado ya pertenece a otra entrega."
            });
        }

        const resultado =
            await conexion.execute(
                `
                UPDATE ENTREGA
                SET
                    ID_DIRECCION =
                        :idDireccion,

                    ID_USUARIO =
                        :idRepartidor,

                    ID_DETALLE_PEDIDO =
                        :idDetallePedido,

                    ID_ESTADO =
                        :idEstado,

                    FECHA_ENTREGA =
                        TO_DATE(
                            :fechaEntrega,
                            'YYYY-MM-DD'
                        )

                WHERE ID_ENTREGA =
                      :idEntrega

                  AND ID_ESTADO <> 6
                `,
                {
                    idDireccion,
                    idRepartidor,
                    idDetallePedido,
                    idEstado,
                    fechaEntrega,
                    idEntrega
                },
                {
                    autoCommit: false
                }
            );

        if (resultado.rowsAffected === 0) {
            await conexion.rollback();

            return res.status(404).json({
                correcto: false,
                mensaje:
                    "La entrega no existe o fue eliminada."
            });
        }

        await conexion.commit();

        return res.status(200).json({
            correcto: true,
            mensaje:
                "Entrega actualizada correctamente.",
            entrega: {
                idEntrega,
                idDireccion,
                idRepartidor,
                idDetallePedido,
                idEstado,
                fechaEntrega
            }
        });
    } catch (error) {
        console.error(
            "Error al editar entrega:",
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
            mensaje:
                "No se pudo actualizar la entrega.",
            error: error.message,
            codigoOracle:
                error.errorNum || null
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


async function eliminarEntrega(req, res) {
    let conexion;

    try {
        const idEntrega = Number(
            req.params.id
        );

        if (
            !Number.isInteger(idEntrega) ||
            idEntrega <= 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El identificador de la entrega no es válido."
            });
        }

        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(
                `
                UPDATE ENTREGA
                SET ID_ESTADO = 6

                WHERE ID_ENTREGA =
                      :idEntrega

                  AND ID_ESTADO <> 6
                `,
                {
                    idEntrega
                },
                {
                    autoCommit: false
                }
            );

        if (resultado.rowsAffected === 0) {
            await conexion.rollback();

            return res.status(404).json({
                correcto: false,
                mensaje:
                    "La entrega no existe o ya fue eliminada."
            });
        }

        await conexion.commit();

        return res.status(200).json({
            correcto: true,
            mensaje:
                "Entrega eliminada correctamente."
        });
    } catch (error) {
        console.error(
            "Error al eliminar entrega:",
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
            mensaje:
                "No se pudo eliminar la entrega.",
            error: error.message,
            codigoOracle:
                error.errorNum || null
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
    listarEntregas,
    listarPedidosEntrega,
    listarRepartidores,
    guardarEntrega,
    editarEntrega,
    eliminarEntrega
};