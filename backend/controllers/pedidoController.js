const { obtenerConexion } = require("../config/db");

function validarPedido(datos) {
    const idUsuario = Number(datos.idUsuario);

    const idProducto = Number(datos.idProducto);

    const cantidad = Number(datos.cantidad);

    const idEstado = Number(datos.idEstado);

    const fechaPedido = datos.fechaPedido
        ? String(datos.fechaPedido).trim()
        : "";

    if (
        !Number.isInteger(idUsuario) ||
        idUsuario <= 0
    ) {
        return {
            error:
                "Debe seleccionar un cliente válido."
        };
    }

    if (
        !Number.isInteger(idProducto) ||
        idProducto <= 0
    ) {
        return {
            error:
                "Debe seleccionar un producto válido."
        };
    }

    if (
        !Number.isInteger(cantidad) ||
        cantidad <= 0
    ) {
        return {
            error:
                "La cantidad debe ser un número entero mayor que cero."
        };
    }

    if (!fechaPedido) {
        return {
            error:
                "Debe seleccionar la fecha del pedido."
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
        pedido: {
            idUsuario,
            idProducto,
            cantidad,
            fechaPedido,
            idEstado
        }
    };
}


async function listarPedidos(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    PE.ID_PEDIDO AS "idPedido",
                    PE.ID_USUARIO AS "idUsuario",
                    DP.ID_PRODUCTO AS "idProducto",

                    TRIM(
                        U.NOMBRE || ' ' ||
                        NVL(U.PRIMER_APELLIDO, '') || ' ' ||
                        NVL(U.SEGUNDO_APELLIDO, '')
                    ) AS "cliente",

                    PR.NOMBRE AS "producto",
                    PE.CANTIDAD AS "cantidad",
                    PE.PRECIO_UNITARIO AS "precioUnitario",

                    TO_CHAR(
                        PE.FECHA_PEDIDO,
                        'YYYY-MM-DD'
                    ) AS "fechaPedido",

                    PE.ID_ESTADO AS "idEstado",
                    E.ESTADO AS "estado"

                FROM PEDIDO PE

                INNER JOIN USUARIO U
                    ON U.ID_USUARIO =
                       PE.ID_USUARIO

                INNER JOIN DETALLE_PEDIDO DP
                    ON DP.ID_PEDIDO =
                       PE.ID_PEDIDO

                INNER JOIN PRODUCTO PR
                    ON PR.ID_PRODUCTO =
                       DP.ID_PRODUCTO

                INNER JOIN ESTADO E
                    ON E.ID_ESTADO =
                       PE.ID_ESTADO

                WHERE PE.ID_ESTADO <> 6
                  AND DP.ID_ESTADO <> 6

                ORDER BY PE.ID_PEDIDO
            `);

        return res.status(200).json({
            correcto: true,
            pedidos: resultado.rows
        });
    } catch (error) {
        console.error(
            "Error al listar pedidos:",
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


async function listarClientes(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    U.ID_USUARIO AS "idUsuario",

                    TRIM(
                        U.NOMBRE || ' ' ||
                        NVL(U.PRIMER_APELLIDO, '') || ' ' ||
                        NVL(U.SEGUNDO_APELLIDO, '')
                    ) AS "nombreCompleto"

                FROM USUARIO U

                WHERE U.ID_ESTADO = 1

                  AND U.ID_TIPO_USUARIO
                      IN (2, 3)

                ORDER BY U.NOMBRE
            `);

        return res.status(200).json({
            correcto: true,
            clientes: resultado.rows
        });
    } catch (error) {
        console.error(
            "Error al listar clientes:",
            error
        );

        return res.status(500).json({
            correcto: false,
            mensaje:
                "No se pudieron cargar los clientes.",
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


async function listarProductosPedido(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado =
            await conexion.execute(`
                SELECT
                    P.ID_PRODUCTO AS "idProducto",
                    P.NOMBRE AS "nombre",
                    P.PRECIO AS "precio",
                    NVL(I.CANTIDAD, 0) AS "existencias"

                FROM PRODUCTO P

                LEFT JOIN INVENTARIO I
                    ON I.ID_PRODUCTO =
                       P.ID_PRODUCTO

                WHERE P.ID_ESTADO = 1

                ORDER BY P.NOMBRE
            `);

        return res.status(200).json({
            correcto: true,
            productos: resultado.rows
        });
    } catch (error) {
        console.error(
            "Error al listar productos:",
            error
        );

        return res.status(500).json({
            correcto: false,
            mensaje:
                "No se pudieron cargar los productos.",
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


async function guardarPedido(req, res) {
    let conexion;

    try {
        console.log(
            "Datos del pedido recibidos:",
            req.body
        );

        const validacion =
            validarPedido(req.body);

        if (validacion.error) {
            return res.status(400).json({
                correcto: false,
                mensaje: validacion.error
            });
        }

        const {
            idUsuario,
            idProducto,
            cantidad,
            fechaPedido,
            idEstado
        } = validacion.pedido;

        conexion = await obtenerConexion();


        // VALIDAR CLIENTE

        const resultadoCliente =
            await conexion.execute(
                `
                SELECT COUNT(*) AS "cantidad"
                FROM USUARIO
                WHERE ID_USUARIO = :idUsuario
                  AND ID_ESTADO = 1
                  AND ID_TIPO_USUARIO
                      IN (2, 3)
                `,
                {
                    idUsuario
                }
            );

        if (
            Number(
                resultadoCliente.rows[0]
                    .cantidad
            ) === 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El cliente seleccionado no existe o está inactivo."
            });
        }


        // VALIDAR PRODUCTO Y EXISTENCIAS

        const resultadoProducto =
            await conexion.execute(
                `
                SELECT
                    P.PRECIO AS "precio",
                    NVL(
                        I.CANTIDAD,
                        0
                    ) AS "existencias"

                FROM PRODUCTO P

                LEFT JOIN INVENTARIO I
                    ON I.ID_PRODUCTO =
                       P.ID_PRODUCTO

                WHERE P.ID_PRODUCTO =
                      :idProducto

                  AND P.ID_ESTADO = 1
                `,
                {
                    idProducto
                }
            );

        if (
            resultadoProducto.rows.length ===
            0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El producto seleccionado no existe o está inactivo."
            });
        }

        const precioUnitario =
            Number(
                resultadoProducto.rows[0]
                    .precio
            );

        const existencias =
            Number(
                resultadoProducto.rows[0]
                    .existencias
            );

        if (cantidad > existencias) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    `No hay suficientes existencias. Disponible: ${existencias}.`
            });
        }


        // OBTENER IDS

        const resultadoIds =
            await conexion.execute(`
                SELECT
                    (
                        SELECT NVL(
                            MAX(ID_PEDIDO),
                            0
                        ) + 1
                        FROM PEDIDO
                    ) AS "idPedido",

                    (
                        SELECT NVL(
                            MAX(
                                ID_DETALLE_PEDIDO
                            ),
                            0
                        ) + 1
                        FROM DETALLE_PEDIDO
                    ) AS "idDetallePedido"

                FROM DUAL
            `);

        const idPedido =
            resultadoIds.rows[0]
                .idPedido;

        const idDetallePedido =
            resultadoIds.rows[0]
                .idDetallePedido;

        // INSERTAR PEDIDO
        await conexion.execute(
            `
            INSERT INTO PEDIDO (
                ID_PEDIDO,
                ID_USUARIO,
                ID_ESTADO,
                FECHA_PEDIDO,
                CANTIDAD,
                PRECIO_UNITARIO
            )
            VALUES (
                :idPedido,
                :idUsuario,
                :idEstado,
                TO_DATE(
                    :fechaPedido,
                    'YYYY-MM-DD'
                ),
                :cantidad,
                :precioUnitario
            )
            `,
            {
                idPedido,
                idUsuario,
                idEstado,
                fechaPedido,
                cantidad,
                precioUnitario
            },
            {
                autoCommit: false
            }
        );
        // INSERTAR DETALLE DEL PEDIDO
        console.log(
            "Cantidad que se va a insertar en DETALLE_PEDIDO:",
            cantidad
        );

        console.log(
            "Tipo de dato:",
            typeof cantidad
        );

        await conexion.execute(
            `
            INSERT INTO DETALLE_PEDIDO (
                ID_DETALLE_PEDIDO,
                ID_PEDIDO,
                ID_PRODUCTO,
                ID_ESTADO,
                CANTIDAD
            )
            VALUES (
                :idDetallePedido,
                :idPedido,
                :idProducto,
                :idEstado,
                :cantidad
            )
            `,
            {
                idDetallePedido,
                idPedido,
                idProducto,
                idEstado,
                cantidad
            },
            {
                autoCommit: false
            }
        );
        // CONFIRMAR TRANSACCIÓN

        await conexion.commit();


        return res.status(201).json({
            correcto: true,
            mensaje:
                "Pedido guardado correctamente.",
            pedido: {
                idPedido,
                idUsuario,
                idProducto,
                cantidad,
                precioUnitario,
                fechaPedido,
                idEstado
            }
        });
    } catch (error) {
        console.error(
            "Error al guardar pedido:",
            error
        );

        console.error(
            "Código Oracle:",
            error.errorNum
        );

        console.error(
            "Mensaje:",
            error.message
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
                "No se pudo guardar el pedido.",
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


async function editarPedido(req, res) {
    let conexion;

    try {
        const idPedido =
            Number(req.params.id);

        if (
            !Number.isInteger(idPedido) ||
            idPedido <= 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El identificador del pedido no es válido."
            });
        }

        const validacion =
            validarPedido(req.body);

        if (validacion.error) {
            return res.status(400).json({
                correcto: false,
                mensaje: validacion.error
            });
        }

        const {
            idUsuario,
            idProducto,
            cantidad,
            fechaPedido,
            idEstado
        } = validacion.pedido;

        conexion =
            await obtenerConexion();


        // VALIDAR CLIENTE

        const resultadoCliente =
            await conexion.execute(
                `
                SELECT COUNT(*) AS "cantidad"
                FROM USUARIO
                WHERE ID_USUARIO = :idUsuario
                  AND ID_ESTADO = 1
                  AND ID_TIPO_USUARIO
                      IN (2, 3)
                `,
                {
                    idUsuario
                }
            );

        if (
            Number(
                resultadoCliente.rows[0]
                    .cantidad
            ) === 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El cliente seleccionado no existe o está inactivo."
            });
        }


     // ==========================================
// VALIDAR PRODUCTO Y EXISTENCIAS
// ==========================================

const resultadoDetalleActual =
    await conexion.execute(
        `
        SELECT ID_PRODUCTO AS "idProducto", CANTIDAD AS "cantidad"
        FROM DETALLE_PEDIDO
        WHERE ID_PEDIDO = :idPedido
          AND ID_ESTADO <> 6
        `,
        { idPedido }
    );

const detalleActual = resultadoDetalleActual.rows[0] || null;

const resultadoProducto = await conexion.execute(
    `
    SELECT P.PRECIO AS "precio", NVL(I.CANTIDAD, 0) AS "existencias"
    FROM PRODUCTO P
    LEFT JOIN INVENTARIO I ON I.ID_PRODUCTO = P.ID_PRODUCTO
    WHERE P.ID_PRODUCTO = :idProducto AND P.ID_ESTADO = 1
    `,
    { idProducto }
);

if (resultadoProducto.rows.length === 0) {
    return res.status(400).json({
        correcto: false,
        mensaje: "El producto seleccionado no existe o está inactivo."
    });
}

const precioUnitario = Number(resultadoProducto.rows[0].precio);
let existencias = Number(resultadoProducto.rows[0].existencias);

// Si el pedido ya tenía reservado stock de este mismo producto,
// esa cantidad cuenta como "disponible" para la edición.
if (detalleActual && detalleActual.idProducto === idProducto) {
    existencias += Number(detalleActual.cantidad) || 0;
}

if (cantidad > existencias) {
    return res.status(400).json({
        correcto: false,
        mensaje: `No hay suficientes existencias. Disponible: ${existencias}.`
    });
}

        // ACTUALIZAR PEDIDO

        const resultadoPedido =
            await conexion.execute(
                `
                UPDATE PEDIDO
                SET
                    ID_USUARIO =
                        :idUsuario,

                    ID_ESTADO =
                        :idEstado,

                    FECHA_PEDIDO =
                        TO_DATE(
                            :fechaPedido,
                            'YYYY-MM-DD'
                        ),

                    CANTIDAD =
                        :cantidad,

                    PRECIO_UNITARIO =
                        :precioUnitario

                WHERE ID_PEDIDO =
                      :idPedido

                  AND ID_ESTADO <> 6
                `,
                {
                    idUsuario,
                    idEstado,
                    fechaPedido,
                    cantidad,
                    precioUnitario,
                    idPedido
                },
                {
                    autoCommit: false
                }
            );

        if (
            resultadoPedido.rowsAffected ===
            0
        ) {
            await conexion.rollback();

            return res.status(404).json({
                correcto: false,
                mensaje:
                    "El pedido no existe."
            });
        }

        // ACTUALIZAR DETALLE
        const resultadoDetalle =
            await conexion.execute(
                `
                UPDATE DETALLE_PEDIDO
                SET
                    ID_PRODUCTO =
                        :idProducto,

                    ID_ESTADO =
                        :idEstado,

                    CANTIDAD =
                        :cantidad

                WHERE ID_PEDIDO =
                      :idPedido

                  AND ID_ESTADO <> 6
                `,
                {
                    idProducto,
                    idEstado,
                    cantidad,
                    idPedido
                },
                {
                    autoCommit: false
                }
            );


        // CREAR DETALLE SI NO EXISTE

        if (
            resultadoDetalle.rowsAffected ===
            0
        ) {
            const resultadoIdDetalle =
                await conexion.execute(`
                    SELECT
                        NVL(
                            MAX(
                                ID_DETALLE_PEDIDO
                            ),
                            0
                        ) + 1
                            AS "idDetallePedido"

                    FROM DETALLE_PEDIDO
                `);

            const idDetallePedido =
                resultadoIdDetalle.rows[0]
                    .idDetallePedido;

            await conexion.execute(
                `
                INSERT INTO DETALLE_PEDIDO (
                    ID_DETALLE_PEDIDO,
                    ID_PEDIDO,
                    ID_PRODUCTO,
                    ID_ESTADO,
                    CANTIDAD
                )
                VALUES (
                    :idDetallePedido,
                    :idPedido,
                    :idProducto,
                    :idEstado,
                    :cantidad
                )
                `,
                {
                    idDetallePedido,
                    idPedido,
                    idProducto,
                    idEstado,
                    cantidad
                },
                {
                    autoCommit: false
                }
            );
        }

        // CONFIRMAR CAMBIOS
        await conexion.commit();

        return res.status(200).json({
            correcto: true,
            mensaje:
                "Pedido actualizado correctamente.",
            pedido: {
                idPedido,
                idUsuario,
                idProducto,
                cantidad,
                precioUnitario,
                fechaPedido,
                idEstado
            }
        });

    } catch (error) {
        console.error(
            "Error al editar pedido:",
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
                "No se pudo actualizar el pedido.",
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


async function eliminarPedido(req, res) {
    let conexion;

    try {
        const idPedido =
            Number(req.params.id);

        if (
            !Number.isInteger(idPedido) ||
            idPedido <= 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El identificador del pedido no es válido."
            });
        }

        conexion =
            await obtenerConexion();


        // ELIMINAR LÓGICAMENTE EL DETALLE

        await conexion.execute(
            `
            UPDATE DETALLE_PEDIDO
            SET ID_ESTADO = 6

            WHERE ID_PEDIDO = :idPedido
            `,
            {
                idPedido
            },
            {
                autoCommit: false
            }
        );


        // ELIMINAR LÓGICAMENTE EL PEDIDO

        const resultado =
            await conexion.execute(
                `
                UPDATE PEDIDO
                SET ID_ESTADO = 6
                WHERE ID_PEDIDO = :idPedido
                  AND ID_ESTADO <> 6
                `,
                {
                    idPedido
                },
                {
                    autoCommit: false
                }
            );

        if (
            resultado.rowsAffected ===
            0
        ) {
            await conexion.rollback();

            return res.status(404).json({
                correcto: false,
                mensaje:
                    "El pedido no existe o ya fue eliminado."
            });
        }

        // CONFIRMAR
        await conexion.commit();

        return res.status(200).json({
            correcto: true,
            mensaje:
                "Pedido eliminado correctamente."
        });
    } catch (error) {
        console.error(
            "Error al eliminar pedido:",
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
                "No se pudo eliminar el pedido.",
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
    listarPedidos,
    listarClientes,
    listarProductosPedido,
    guardarPedido,
    editarPedido,
    eliminarPedido
};