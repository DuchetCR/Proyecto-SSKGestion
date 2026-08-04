const { obtenerConexion } = require("../config/db");


function validarPago(datos) {
    const idPedido = Number(datos.idPedido);
    const idMetodoPago = Number(datos.idMetodoPago);
    const monto = Number(datos.monto);
    const idEstado = Number(datos.idEstado);

    if (
        !Number.isInteger(idPedido) ||
        idPedido <= 0
    ) {
        return {
            error: "Debe seleccionar un pedido válido."
        };
    }

    if (
        !Number.isInteger(idMetodoPago) ||
        idMetodoPago <= 0
    ) {
        return {
            error:
                "Debe seleccionar un método de pago válido."
        };
    }

    if (
        !Number.isFinite(monto) ||
        monto <= 0
    ) {
        return {
            error:
                "El monto debe ser mayor que cero."
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
        pago: {
            idPedido,
            idMetodoPago,
            monto,
            idEstado
        }
    };
}


async function listarPedidosPago(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    PE.ID_PEDIDO
                        AS "idPedido",

                    PE.ID_USUARIO
                        AS "idUsuario",

                    TRIM(
                        NVL(U.NOMBRE, '') || ' ' ||
                        NVL(U.PRIMER_APELLIDO, '') || ' ' ||
                        NVL(U.SEGUNDO_APELLIDO, '')
                    ) AS "cliente",

                    PR.NOMBRE
                        AS "producto",

                    PE.CANTIDAD
                        AS "cantidad",

                    PE.PRECIO_UNITARIO
                        AS "precioUnitario",

                    (
                        PE.CANTIDAD *
                        PE.PRECIO_UNITARIO
                    ) AS "totalPedido",

                    TO_CHAR(
                        PE.FECHA_PEDIDO,
                        'YYYY-MM-DD'
                    ) AS "fechaPedido"

                FROM PEDIDO PE

                INNER JOIN USUARIO U
                    ON U.ID_USUARIO =
                       PE.ID_USUARIO

                LEFT JOIN DETALLE_PEDIDO DP
                    ON DP.ID_PEDIDO =
                       PE.ID_PEDIDO

                   AND DP.ID_ESTADO <> 6

                LEFT JOIN PRODUCTO PR
                    ON PR.ID_PRODUCTO =
                       DP.ID_PRODUCTO

                WHERE PE.ID_ESTADO <> 6

                ORDER BY PE.ID_PEDIDO
            `);

        return res.status(200).json({
            correcto: true,
            pedidos: resultado.rows
        });
    } catch (error) {
        console.error(
            "Error al listar pedidos para pagos:",
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
                    "Error cerrando conexión:",
                    errorCierre.message
                );
            }
        }
    }
}


async function listarPagos(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    PA.ID_PAGO
                        AS "idPago",

                    DF.ID_DETALLE_FACTURA
                        AS "idDetalleFactura",

                    DF.ID_PEDIDO
                        AS "idPedido",

                    PE.ID_USUARIO
                        AS "idUsuario",

                    TRIM(
                        NVL(U.NOMBRE, '') || ' ' ||
                        NVL(U.PRIMER_APELLIDO, '') || ' ' ||
                        NVL(U.SEGUNDO_APELLIDO, '')
                    ) AS "cliente",

                    PR.NOMBRE
                        AS "producto",

                    PA.ID_METODO_DE_PAGO
                        AS "idMetodoPago",

                    MP.METODO_DE_PAGO
                        AS "metodoPago",

                    PA.MONTO
                        AS "monto",

                    PA.ID_ESTADO
                        AS "idEstado",

                    ES.ESTADO
                        AS "estado"

                FROM PAGO PA

                INNER JOIN METODO_DE_PAGO MP
                    ON MP.ID_METODO_DE_PAGO =
                       PA.ID_METODO_DE_PAGO

                INNER JOIN ESTADO ES
                    ON ES.ID_ESTADO =
                       PA.ID_ESTADO

                INNER JOIN DETALLE_FACTURA DF
                    ON DF.ID_PAGO =
                       PA.ID_PAGO

                   AND DF.ID_ESTADO <> 6

                INNER JOIN PEDIDO PE
                    ON PE.ID_PEDIDO =
                       DF.ID_PEDIDO

                INNER JOIN USUARIO U
                    ON U.ID_USUARIO =
                       PE.ID_USUARIO

                LEFT JOIN DETALLE_PEDIDO DP
                    ON DP.ID_PEDIDO =
                       PE.ID_PEDIDO

                   AND DP.ID_ESTADO <> 6

                LEFT JOIN PRODUCTO PR
                    ON PR.ID_PRODUCTO =
                       DP.ID_PRODUCTO

                WHERE PA.ID_ESTADO <> 6

                ORDER BY PA.ID_PAGO
            `);

        return res.status(200).json({
            correcto: true,
            pagos: resultado.rows
        });
    } catch (error) {
        console.error(
            "Error al listar pagos:",
            error
        );

        return res.status(500).json({
            correcto: false,
            mensaje:
                "No se pudieron cargar los pagos.",
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


async function listarMetodosPago(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    ID_METODO_DE_PAGO
                        AS "idMetodoPago",

                    METODO_DE_PAGO
                        AS "metodoPago"

                FROM METODO_DE_PAGO

                WHERE ID_ESTADO = 1

                ORDER BY ID_METODO_DE_PAGO
            `);

        return res.status(200).json({
            correcto: true,
            metodos: resultado.rows
        });
    } catch (error) {
        console.error(
            "Error al listar métodos de pago:",
            error
        );

        return res.status(500).json({
            correcto: false,
            mensaje:
                "No se pudieron cargar los métodos de pago.",
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


async function obtenerResumenPagos(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    MP.ID_METODO_DE_PAGO
                        AS "idMetodoPago",

                    MP.METODO_DE_PAGO
                        AS "metodoPago",

                    NVL(
                        SUM(
                            CASE
                                WHEN PA.ID_ESTADO = 5
                                THEN PA.MONTO
                                ELSE 0
                            END
                        ),
                        0
                    ) AS "total"

                FROM METODO_DE_PAGO MP

                LEFT JOIN PAGO PA
                    ON PA.ID_METODO_DE_PAGO =
                       MP.ID_METODO_DE_PAGO

                   AND PA.ID_ESTADO <> 6

                WHERE MP.ID_ESTADO = 1

                GROUP BY
                    MP.ID_METODO_DE_PAGO,
                    MP.METODO_DE_PAGO

                ORDER BY
                    MP.ID_METODO_DE_PAGO
            `);

        return res.status(200).json({
            correcto: true,
            resumen: resultado.rows
        });
    } catch (error) {
        console.error(
            "Error al obtener resumen de pagos:",
            error
        );

        return res.status(500).json({
            correcto: false,
            mensaje:
                "No se pudo cargar el resumen de pagos.",
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


async function guardarPago(req, res) {
    let conexion;

    try {
        console.log(
            "Datos del pago recibidos:",
            req.body
        );

        const validacion = validarPago(
            req.body
        );

        if (validacion.error) {
            return res.status(400).json({
                correcto: false,
                mensaje: validacion.error
            });
        }

        const {
            idPedido,
            idMetodoPago,
            monto,
            idEstado
        } = validacion.pago;

        conexion = await obtenerConexion();

        const resultadoPedido =
            await conexion.execute(
                `
                SELECT
                    ID_USUARIO
                        AS "idUsuario",

                    CANTIDAD
                        AS "cantidad",

                    PRECIO_UNITARIO
                        AS "precioUnitario"

                FROM PEDIDO

                WHERE ID_PEDIDO =
                      :idPedido

                  AND ID_ESTADO <> 6
                `,
                {
                    idPedido
                }
            );

        if (
            resultadoPedido.rows.length === 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El pedido seleccionado no existe o fue eliminado."
            });
        }

        const idUsuario = Number(
            resultadoPedido.rows[0].idUsuario
        );

        const cantidadPedido = Number(
            resultadoPedido.rows[0].cantidad
        );

        const precioUnitario = Number(
            resultadoPedido.rows[0]
                .precioUnitario
        );

        const totalPedido =
            cantidadPedido * precioUnitario;

        if (monto > totalPedido) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    `El monto no puede superar el total del pedido: ₡${totalPedido}.`
            });
        }

        const resultadoMetodo =
            await conexion.execute(
                `
                SELECT COUNT(*) AS "cantidad"

                FROM METODO_DE_PAGO

                WHERE ID_METODO_DE_PAGO =
                      :idMetodoPago

                  AND ID_ESTADO = 1
                `,
                {
                    idMetodoPago
                }
            );

        if (
            Number(
                resultadoMetodo.rows[0]
                    .cantidad
            ) === 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El método de pago seleccionado no existe o está inactivo."
            });
        }

        const resultadoPagoExistente =
            await conexion.execute(
                `
                SELECT COUNT(*) AS "cantidad"

                FROM DETALLE_FACTURA DF

                INNER JOIN PAGO PA
                    ON PA.ID_PAGO =
                       DF.ID_PAGO

                WHERE DF.ID_PEDIDO =
                      :idPedido

                  AND DF.ID_ESTADO <> 6
                  AND PA.ID_ESTADO <> 6
                `,
                {
                    idPedido
                }
            );

        if (
            Number(
                resultadoPagoExistente.rows[0]
                    .cantidad
            ) > 0
        ) {
            return res.status(409).json({
                correcto: false,
                mensaje:
                    "El pedido seleccionado ya tiene un pago registrado."
            });
        }

        const resultadoIds =
            await conexion.execute(`
                SELECT
                    (
                        SELECT NVL(
                            MAX(ID_PAGO),
                            0
                        ) + 1
                        FROM PAGO
                    ) AS "idPago",

                    (
                        SELECT NVL(
                            MAX(
                                ID_DETALLE_FACTURA
                            ),
                            0
                        ) + 1
                        FROM DETALLE_FACTURA
                    ) AS "idDetalleFactura"

                FROM DUAL
            `);

        const idPago =
            resultadoIds.rows[0].idPago;

        const idDetalleFactura =
            resultadoIds.rows[0]
                .idDetalleFactura;

        await conexion.execute(
            `
            INSERT INTO PAGO (
                ID_PAGO,
                ID_METODO_DE_PAGO,
                ID_ESTADO,
                MONTO
            )
            VALUES (
                :idPago,
                :idMetodoPago,
                :idEstado,
                :monto
            )
            `,
            {
                idPago,
                idMetodoPago,
                idEstado,
                monto
            },
            {
                autoCommit: false
            }
        );

        await conexion.execute(
            `
            INSERT INTO DETALLE_FACTURA (
                ID_DETALLE_FACTURA,
                ID_ESTADO,
                ID_PAGO,
                ID_PEDIDO,
                ID_FACTURA,
                ID_USUARIO
            )
            VALUES (
                :idDetalleFactura,
                :idEstado,
                :idPago,
                :idPedido,
                NULL,
                :idUsuario
            )
            `,
            {
                idDetalleFactura,
                idEstado,
                idPago,
                idPedido,
                idUsuario
            },
            {
                autoCommit: false
            }
        );

        await conexion.commit();

        return res.status(201).json({
            correcto: true,
            mensaje:
                "Pago registrado y relacionado con el pedido correctamente.",
            pago: {
                idPago,
                idDetalleFactura,
                idPedido,
                idMetodoPago,
                monto,
                idEstado
            }
        });
    } catch (error) {
        console.error(
            "Error al guardar pago:",
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
                "No se pudo registrar el pago.",
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


async function editarPago(req, res) {
    let conexion;

    try {
        const idPago = Number(
            req.params.id
        );

        if (
            !Number.isInteger(idPago) ||
            idPago <= 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El identificador del pago no es válido."
            });
        }

        const validacion = validarPago(
            req.body
        );

        if (validacion.error) {
            return res.status(400).json({
                correcto: false,
                mensaje: validacion.error
            });
        }

        const {
            idPedido,
            idMetodoPago,
            monto,
            idEstado
        } = validacion.pago;

        conexion = await obtenerConexion();

        const resultadoPedido =
            await conexion.execute(
                `
                SELECT
                    ID_USUARIO
                        AS "idUsuario",

                    CANTIDAD
                        AS "cantidad",

                    PRECIO_UNITARIO
                        AS "precioUnitario"

                FROM PEDIDO

                WHERE ID_PEDIDO =
                      :idPedido

                  AND ID_ESTADO <> 6
                `,
                {
                    idPedido
                }
            );

        if (
            resultadoPedido.rows.length === 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El pedido seleccionado no existe o fue eliminado."
            });
        }

        const idUsuario = Number(
            resultadoPedido.rows[0].idUsuario
        );

        const cantidadPedido = Number(
            resultadoPedido.rows[0].cantidad
        );

        const precioUnitario = Number(
            resultadoPedido.rows[0]
                .precioUnitario
        );

        const totalPedido =
            cantidadPedido * precioUnitario;

        if (monto > totalPedido) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    `El monto no puede superar el total del pedido: ₡${totalPedido}.`
            });
        }

        const resultadoMetodo =
            await conexion.execute(
                `
                SELECT COUNT(*) AS "cantidad"

                FROM METODO_DE_PAGO

                WHERE ID_METODO_DE_PAGO =
                      :idMetodoPago

                  AND ID_ESTADO = 1
                `,
                {
                    idMetodoPago
                }
            );

        if (
            Number(
                resultadoMetodo.rows[0]
                    .cantidad
            ) === 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El método de pago seleccionado no existe o está inactivo."
            });
        }

        const resultadoDuplicado =
            await conexion.execute(
                `
                SELECT COUNT(*) AS "cantidad"

                FROM DETALLE_FACTURA DF

                INNER JOIN PAGO PA
                    ON PA.ID_PAGO =
                       DF.ID_PAGO

                WHERE DF.ID_PEDIDO =
                      :idPedido

                  AND DF.ID_PAGO <>
                      :idPago

                  AND DF.ID_ESTADO <> 6
                  AND PA.ID_ESTADO <> 6
                `,
                {
                    idPedido,
                    idPago
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
                    "El pedido seleccionado ya tiene otro pago registrado."
            });
        }

        const resultadoPago =
            await conexion.execute(
                `
                UPDATE PAGO
                SET
                    ID_METODO_DE_PAGO =
                        :idMetodoPago,

                    ID_ESTADO =
                        :idEstado,

                    MONTO =
                        :monto

                WHERE ID_PAGO =
                      :idPago

                  AND ID_ESTADO <> 6
                `,
                {
                    idMetodoPago,
                    idEstado,
                    monto,
                    idPago
                },
                {
                    autoCommit: false
                }
            );

        if (
            resultadoPago.rowsAffected === 0
        ) {
            await conexion.rollback();

            return res.status(404).json({
                correcto: false,
                mensaje:
                    "El pago no existe o fue eliminado."
            });
        }

        const resultadoDetalle =
            await conexion.execute(
                `
                UPDATE DETALLE_FACTURA
                SET
                    ID_PEDIDO =
                        :idPedido,

                    ID_USUARIO =
                        :idUsuario,

                    ID_ESTADO =
                        :idEstado

                WHERE ID_PAGO =
                      :idPago

                  AND ID_ESTADO <> 6
                `,
                {
                    idPedido,
                    idUsuario,
                    idEstado,
                    idPago
                },
                {
                    autoCommit: false
                }
            );

        
        if (
            resultadoDetalle.rowsAffected === 0
        ) {
            const resultadoId =
                await conexion.execute(`
                    SELECT
                        NVL(
                            MAX(
                                ID_DETALLE_FACTURA
                            ),
                            0
                        ) + 1
                            AS "idDetalleFactura"

                    FROM DETALLE_FACTURA
                `);

            const idDetalleFactura =
                resultadoId.rows[0]
                    .idDetalleFactura;

            await conexion.execute(
                `
                INSERT INTO DETALLE_FACTURA (
                    ID_DETALLE_FACTURA,
                    ID_ESTADO,
                    ID_PAGO,
                    ID_PEDIDO,
                    ID_FACTURA,
                    ID_USUARIO
                )
                VALUES (
                    :idDetalleFactura,
                    :idEstado,
                    :idPago,
                    :idPedido,
                    NULL,
                    :idUsuario
                )
                `,
                {
                    idDetalleFactura,
                    idEstado,
                    idPago,
                    idPedido,
                    idUsuario
                },
                {
                    autoCommit: false
                }
            );
        }

        await conexion.commit();

        return res.status(200).json({
            correcto: true,
            mensaje:
                "Pago y pedido actualizados correctamente."
        });
    } catch (error) {
        console.error(
            "Error al editar pago:",
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
                "No se pudo actualizar el pago.",
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


async function eliminarPago(req, res) {
    let conexion;

    try {
        const idPago = Number(
            req.params.id
        );

        if (
            !Number.isInteger(idPago) ||
            idPago <= 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El identificador del pago no es válido."
            });
        }

        conexion = await obtenerConexion();

        const resultadoPago =
            await conexion.execute(
                `
                UPDATE PAGO
                SET ID_ESTADO = 6

                WHERE ID_PAGO =
                      :idPago

                  AND ID_ESTADO <> 6
                `,
                {
                    idPago
                },
                {
                    autoCommit: false
                }
            );

        if (
            resultadoPago.rowsAffected === 0
        ) {
            await conexion.rollback();

            return res.status(404).json({
                correcto: false,
                mensaje:
                    "El pago no existe o ya fue eliminado."
            });
        }

        await conexion.execute(
            `
            UPDATE DETALLE_FACTURA
            SET ID_ESTADO = 6

            WHERE ID_PAGO =
                  :idPago

              AND ID_ESTADO <> 6
            `,
            {
                idPago
            },
            {
                autoCommit: false
            }
        );

        await conexion.commit();

        return res.status(200).json({
            correcto: true,
            mensaje:
                "Pago eliminado correctamente."
        });
    } catch (error) {
        console.error(
            "Error al eliminar pago:",
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
                "No se pudo eliminar el pago.",
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
    listarPedidosPago,
    listarPagos,
    listarMetodosPago,
    obtenerResumenPagos,
    guardarPago,
    editarPago,
    eliminarPago
};