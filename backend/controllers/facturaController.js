const { obtenerConexion } = require("../config/db");


function validarFactura(datos) {
    const idDetalleFactura = Number(
        datos.idDetalleFactura
    );

    const idEstado = Number(
        datos.idEstado
    );

    const total = Number(
        datos.total
    );

    const fechaPago = datos.fechaPago
        ? String(datos.fechaPago).trim()
        : "";

    if (
        !Number.isInteger(idDetalleFactura) ||
        idDetalleFactura <= 0
    ) {
        return {
            error:
                "Debe seleccionar un pago relacionado con un pedido."
        };
    }

    if (!fechaPago) {
        return {
            error:
                "Debe seleccionar la fecha de la factura."
        };
    }

    if (
        !Number.isFinite(total) ||
        total <= 0
    ) {
        return {
            error:
                "El total debe ser mayor que cero."
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
        factura: {
            idDetalleFactura,
            fechaPago,
            total,
            idEstado
        }
    };
}


async function listarFacturas(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    F.ID_FACTURA
                        AS "idFactura",

                    F.ID_DETALLE_FACTURA
                        AS "idDetalleFactura",

                    DF.ID_PAGO
                        AS "idPago",

                    DF.ID_PEDIDO
                        AS "idPedido",

                    DF.ID_USUARIO
                        AS "idUsuario",

                    TRIM(
                        NVL(U.NOMBRE, '') || ' ' ||
                        NVL(U.PRIMER_APELLIDO, '') || ' ' ||
                        NVL(U.SEGUNDO_APELLIDO, '')
                    ) AS "cliente",

                    PR.NOMBRE
                        AS "producto",

                    MP.METODO_DE_PAGO
                        AS "metodoPago",

                    PA.MONTO
                        AS "montoPago",

                    TO_CHAR(
                        F.FECHA_PAGO,
                        'YYYY-MM-DD'
                    ) AS "fechaPago",

                    F.TOTAL
                        AS "total",

                    F.ID_ESTADO
                        AS "idEstado",

                    ES.ESTADO
                        AS "estado"

                FROM FACTURA F

                INNER JOIN DETALLE_FACTURA DF
                    ON DF.ID_DETALLE_FACTURA =
                       F.ID_DETALLE_FACTURA

                   AND DF.ID_FACTURA =
                       F.ID_FACTURA

                INNER JOIN PAGO PA
                    ON PA.ID_PAGO =
                       DF.ID_PAGO

                INNER JOIN METODO_DE_PAGO MP
                    ON MP.ID_METODO_DE_PAGO =
                       PA.ID_METODO_DE_PAGO

                INNER JOIN PEDIDO PE
                    ON PE.ID_PEDIDO =
                       DF.ID_PEDIDO

                INNER JOIN USUARIO U
                    ON U.ID_USUARIO =
                       DF.ID_USUARIO

                LEFT JOIN DETALLE_PEDIDO DP
                    ON DP.ID_PEDIDO =
                       PE.ID_PEDIDO

                   AND DP.ID_ESTADO <> 6

                LEFT JOIN PRODUCTO PR
                    ON PR.ID_PRODUCTO =
                       DP.ID_PRODUCTO

                INNER JOIN ESTADO ES
                    ON ES.ID_ESTADO =
                       F.ID_ESTADO

                WHERE F.ID_ESTADO <> 6

                ORDER BY F.ID_FACTURA
            `);

        return res.status(200).json({
            correcto: true,
            facturas: resultado.rows
        });
    } catch (error) {
        console.error(
            "Error al listar facturas:",
            error
        );

        return res.status(500).json({
            correcto: false,
            mensaje:
                "No se pudieron cargar las facturas.",
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


async function listarPagosParaFactura(
    req,
    res
) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    DF.ID_DETALLE_FACTURA
                        AS "idDetalleFactura",

                    DF.ID_PAGO
                        AS "idPago",

                    DF.ID_PEDIDO
                        AS "idPedido",

                    DF.ID_USUARIO
                        AS "idUsuario",

                    TRIM(
                        NVL(U.NOMBRE, '') || ' ' ||
                        NVL(U.PRIMER_APELLIDO, '') || ' ' ||
                        NVL(U.SEGUNDO_APELLIDO, '')
                    ) AS "cliente",

                    PR.NOMBRE
                        AS "producto",

                    MP.METODO_DE_PAGO
                        AS "metodoPago",

                    PA.MONTO
                        AS "montoPago",

                    PE.CANTIDAD
                        AS "cantidad",

                    PE.PRECIO_UNITARIO
                        AS "precioUnitario",

                    (
                        PE.CANTIDAD *
                        PE.PRECIO_UNITARIO
                    ) AS "totalPedido"

                FROM DETALLE_FACTURA DF

                INNER JOIN PAGO PA
                    ON PA.ID_PAGO =
                       DF.ID_PAGO

                INNER JOIN METODO_DE_PAGO MP
                    ON MP.ID_METODO_DE_PAGO =
                       PA.ID_METODO_DE_PAGO

                INNER JOIN PEDIDO PE
                    ON PE.ID_PEDIDO =
                       DF.ID_PEDIDO

                INNER JOIN USUARIO U
                    ON U.ID_USUARIO =
                       DF.ID_USUARIO

                LEFT JOIN DETALLE_PEDIDO DP
                    ON DP.ID_PEDIDO =
                       PE.ID_PEDIDO

                   AND DP.ID_ESTADO <> 6

                LEFT JOIN PRODUCTO PR
                    ON PR.ID_PRODUCTO =
                       DP.ID_PRODUCTO

                WHERE DF.ID_ESTADO <> 6
                  AND PA.ID_ESTADO <> 6
                  AND PE.ID_ESTADO <> 6
                  AND DF.ID_FACTURA IS NULL

                ORDER BY DF.ID_DETALLE_FACTURA
            `);

        return res.status(200).json({
            correcto: true,
            pagos: resultado.rows
        });
    } catch (error) {
        console.error(
            "Error al listar pagos para factura:",
            error
        );

        return res.status(500).json({
            correcto: false,
            mensaje:
                "No se pudieron cargar los pagos disponibles.",
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


async function obtenerResumenFacturas(
    req,
    res
) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    NVL(
                        SUM(
                            CASE
                                WHEN ID_ESTADO = 5
                                THEN TOTAL
                                ELSE 0
                            END
                        ),
                        0
                    ) AS "totalFacturado",

                    SUM(
                        CASE
                            WHEN ID_ESTADO = 5
                            THEN 1
                            ELSE 0
                        END
                    ) AS "completadas",

                    SUM(
                        CASE
                            WHEN ID_ESTADO = 3
                            THEN 1
                            ELSE 0
                        END
                    ) AS "pendientes"

                FROM FACTURA

                WHERE ID_ESTADO <> 6
            `);

        const resumen =
            resultado.rows[0] || {
                totalFacturado: 0,
                completadas: 0,
                pendientes: 0
            };

        return res.status(200).json({
            correcto: true,
            resumen
        });
    } catch (error) {
        console.error(
            "Error al cargar resumen de facturas:",
            error
        );

        return res.status(500).json({
            correcto: false,
            mensaje:
                "No se pudo cargar el resumen de facturas.",
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


async function guardarFactura(req, res) {
    let conexion;

    try {
        console.log(
            "Datos de factura recibidos:",
            req.body
        );

        const validacion =
            validarFactura(req.body);

        if (validacion.error) {
            return res.status(400).json({
                correcto: false,
                mensaje: validacion.error
            });
        }

        const {
            idDetalleFactura,
            fechaPago,
            total,
            idEstado
        } = validacion.factura;

        conexion = await obtenerConexion();

        const resultadoDetalle =
            await conexion.execute(
                `
                SELECT
                    DF.ID_PAGO
                        AS "idPago",

                    DF.ID_PEDIDO
                        AS "idPedido",

                    PA.MONTO
                        AS "montoPago",

                    (
                        PE.CANTIDAD *
                        PE.PRECIO_UNITARIO
                    ) AS "totalPedido"

                FROM DETALLE_FACTURA DF

                INNER JOIN PAGO PA
                    ON PA.ID_PAGO =
                       DF.ID_PAGO

                INNER JOIN PEDIDO PE
                    ON PE.ID_PEDIDO =
                       DF.ID_PEDIDO

                WHERE DF.ID_DETALLE_FACTURA =
                      :idDetalleFactura

                  AND DF.ID_ESTADO <> 6
                  AND PA.ID_ESTADO <> 6
                  AND PE.ID_ESTADO <> 6
                  AND DF.ID_FACTURA IS NULL
                `,
                {
                    idDetalleFactura
                }
            );

        if (
            resultadoDetalle.rows.length ===
            0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El pago seleccionado no existe o ya tiene una factura."
            });
        }

        const montoPago = Number(
            resultadoDetalle.rows[0].montoPago
        );


        if (total > montoPago) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    `El total no puede superar el monto pagado: ₡${montoPago}.`
            });
        }

        const resultadoId =
            await conexion.execute(`
                SELECT
                    NVL(
                        MAX(ID_FACTURA),
                        0
                    ) + 1 AS "idFactura"

                FROM FACTURA
            `);

        const idFactura =
            resultadoId.rows[0].idFactura;

        await conexion.execute(
            `
            INSERT INTO FACTURA (
                ID_FACTURA,
                ID_DETALLE_FACTURA,
                ID_ESTADO,
                FECHA_PAGO,
                TOTAL
            )
            VALUES (
                :idFactura,
                :idDetalleFactura,
                :idEstado,
                TO_DATE(
                    :fechaPago,
                    'YYYY-MM-DD'
                ),
                :total
            )
            `,
            {
                idFactura,
                idDetalleFactura,
                idEstado,
                fechaPago,
                total
            },
            {
                autoCommit: false
            }
        );

        await conexion.execute(
            `
            UPDATE DETALLE_FACTURA
            SET
                ID_FACTURA =
                    :idFactura,

                ID_ESTADO =
                    :idEstado

            WHERE ID_DETALLE_FACTURA =
                  :idDetalleFactura
            `,
            {
                idFactura,
                idEstado,
                idDetalleFactura
            },
            {
                autoCommit: false
            }
        );

        await conexion.commit();

        return res.status(201).json({
            correcto: true,
            mensaje:
                "Factura registrada correctamente.",
            factura: {
                idFactura,
                idDetalleFactura,
                fechaPago,
                total,
                idEstado
            }
        });
    } catch (error) {
        console.error(
            "Error al guardar factura:",
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
                "No se pudo registrar la factura.",
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


async function editarFactura(req, res) {
    let conexion;

    try {
        const idFactura = Number(
            req.params.id
        );

        if (
            !Number.isInteger(idFactura) ||
            idFactura <= 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El identificador de la factura no es válido."
            });
        }

        const validacion =
            validarFactura(req.body);

        if (validacion.error) {
            return res.status(400).json({
                correcto: false,
                mensaje: validacion.error
            });
        }

        const {
            idDetalleFactura,
            fechaPago,
            total,
            idEstado
        } = validacion.factura;

        conexion = await obtenerConexion();

        const resultadoFacturaActual =
            await conexion.execute(
                `
                SELECT
                    ID_DETALLE_FACTURA
                        AS "idDetalleFacturaActual"

                FROM FACTURA

                WHERE ID_FACTURA =
                      :idFactura

                  AND ID_ESTADO <> 6
                `,
                {
                    idFactura
                }
            );

        if (
            resultadoFacturaActual.rows.length ===
            0
        ) {
            return res.status(404).json({
                correcto: false,
                mensaje:
                    "La factura no existe o fue eliminada."
            });
        }

        const idDetalleFacturaActual =
            Number(
                resultadoFacturaActual.rows[0]
                    .idDetalleFacturaActual
            );

        const resultadoDetalle =
            await conexion.execute(
                `
                SELECT
                    DF.ID_FACTURA
                        AS "idFacturaRelacionada",

                    PA.MONTO
                        AS "montoPago"

                FROM DETALLE_FACTURA DF

                INNER JOIN PAGO PA
                    ON PA.ID_PAGO =
                       DF.ID_PAGO

                INNER JOIN PEDIDO PE
                    ON PE.ID_PEDIDO =
                       DF.ID_PEDIDO

                WHERE DF.ID_DETALLE_FACTURA =
                      :idDetalleFactura

                  AND DF.ID_ESTADO <> 6
                  AND PA.ID_ESTADO <> 6
                  AND PE.ID_ESTADO <> 6
                `,
                {
                    idDetalleFactura
                }
            );

        if (
            resultadoDetalle.rows.length ===
            0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El pago seleccionado no existe o fue eliminado."
            });
        }

        const facturaRelacionada =
            resultadoDetalle.rows[0]
                .idFacturaRelacionada;

        if (
            facturaRelacionada !== null &&
            Number(facturaRelacionada) !==
            idFactura
        ) {
            return res.status(409).json({
                correcto: false,
                mensaje:
                    "El pago seleccionado ya pertenece a otra factura."
            });
        }

        const montoPago = Number(
            resultadoDetalle.rows[0].montoPago
        );

        if (total > montoPago) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    `El total no puede superar el monto pagado: ₡${montoPago}.`
            });
        }

        if (
            idDetalleFacturaActual !==
            idDetalleFactura
        ) {
            await conexion.execute(
                `
                UPDATE DETALLE_FACTURA
                SET ID_FACTURA = NULL

                WHERE ID_DETALLE_FACTURA =
                      :idDetalleFacturaActual

                  AND ID_FACTURA =
                      :idFactura
                `,
                {
                    idDetalleFacturaActual,
                    idFactura
                },
                {
                    autoCommit: false
                }
            );
        }

        const resultadoActualizar =
            await conexion.execute(
                `
                UPDATE FACTURA
                SET
                    ID_DETALLE_FACTURA =
                        :idDetalleFactura,

                    ID_ESTADO =
                        :idEstado,

                    FECHA_PAGO =
                        TO_DATE(
                            :fechaPago,
                            'YYYY-MM-DD'
                        ),

                    TOTAL =
                        :total

                WHERE ID_FACTURA =
                      :idFactura

                  AND ID_ESTADO <> 6
                `,
                {
                    idDetalleFactura,
                    idEstado,
                    fechaPago,
                    total,
                    idFactura
                },
                {
                    autoCommit: false
                }
            );

        if (
            resultadoActualizar.rowsAffected ===
            0
        ) {
            await conexion.rollback();

            return res.status(404).json({
                correcto: false,
                mensaje:
                    "La factura no existe o fue eliminada."
            });
        }

        await conexion.execute(
            `
            UPDATE DETALLE_FACTURA
            SET
                ID_FACTURA =
                    :idFactura,

                ID_ESTADO =
                    :idEstado

            WHERE ID_DETALLE_FACTURA =
                  :idDetalleFactura
            `,
            {
                idFactura,
                idEstado,
                idDetalleFactura
            },
            {
                autoCommit: false
            }
        );

        await conexion.commit();

        return res.status(200).json({
            correcto: true,
            mensaje:
                "Factura actualizada correctamente."
        });
    } catch (error) {
        console.error(
            "Error al editar factura:",
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
                "No se pudo actualizar la factura.",
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


async function eliminarFactura(req, res) {
    let conexion;

    try {
        const idFactura = Number(
            req.params.id
        );

        if (
            !Number.isInteger(idFactura) ||
            idFactura <= 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El identificador de la factura no es válido."
            });
        }

        conexion = await obtenerConexion();

        const resultadoFactura =
            await conexion.execute(
                `
                UPDATE FACTURA
                SET ID_ESTADO = 6

                WHERE ID_FACTURA =
                      :idFactura

                  AND ID_ESTADO <> 6
                `,
                {
                    idFactura
                },
                {
                    autoCommit: false
                }
            );

        if (
            resultadoFactura.rowsAffected ===
            0
        ) {
            await conexion.rollback();

            return res.status(404).json({
                correcto: false,
                mensaje:
                    "La factura no existe o ya fue eliminada."
            });
        }

        await conexion.execute(
            `
            UPDATE DETALLE_FACTURA
            SET ID_FACTURA = NULL

            WHERE ID_FACTURA =
                  :idFactura
            `,
            {
                idFactura
            },
            {
                autoCommit: false
            }
        );

        await conexion.commit();

        return res.status(200).json({
            correcto: true,
            mensaje:
                "Factura eliminada correctamente."
        });
    } catch (error) {
        console.error(
            "Error al eliminar factura:",
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
                "No se pudo eliminar la factura.",
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
    listarFacturas,
    listarPagosParaFactura,
    obtenerResumenFacturas,
    guardarFactura,
    editarFactura,
    eliminarFactura
};