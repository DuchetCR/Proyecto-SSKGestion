const { obtenerConexion } = require("../config/db");


function validarProducto(datos) {
    const nombre = datos.nombre
        ? datos.nombre.trim()
        : "";

    const descripcion = datos.descripcion
        ? datos.descripcion.trim()
        : "";

    const precio = Number(datos.precio);
    const cantidad = Number(datos.cantidad);
    const estado = Number(datos.estado);

    if (!nombre || !descripcion) {
        return {
            error:
                "Complete el nombre y la descripción del producto."
        };
    }

    if (!Number.isFinite(precio) || precio < 0) {
        return {
            error:
                "El precio debe ser un número mayor o igual a cero."
        };
    }

    if (
        !Number.isInteger(cantidad) ||
        cantidad < 0
    ) {
        return {
            error:
                "La cantidad debe ser un número entero mayor o igual a cero."
        };
    }

    if (![1, 2].includes(estado)) {
        return {
            error:
                "El estado del producto no es válido."
        };
    }

    return {
        producto: {
            nombre,
            descripcion,
            precio,
            cantidad,
            estado
        }
    };
}


async function listarProductos(req, res) {
    let conexion;

    try {
        conexion = await obtenerConexion();

        const resultado = await conexion.execute(`
            SELECT
                P.ID_PRODUCTO AS "idProducto",
                P.NOMBRE AS "nombre",
                P.DESCRIPCION AS "descripcion",
                P.PRECIO AS "precio",
                P.ID_ESTADO AS "estado",
                NVL(I.CANTIDAD, 0) AS "cantidad"
            FROM PRODUCTO P
            LEFT JOIN INVENTARIO I
                ON I.ID_PRODUCTO = P.ID_PRODUCTO
            ORDER BY P.ID_PRODUCTO
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


async function guardarProducto(req, res) {
    let conexion;

    try {
        console.log(
            "Datos del producto recibidos:",
            req.body
        );

        const validacion = validarProducto(
            req.body
        );

        if (validacion.error) {
            return res.status(400).json({
                correcto: false,
                mensaje: validacion.error
            });
        }

        const {
            nombre,
            descripcion,
            precio,
            cantidad,
            estado
        } = validacion.producto;

        conexion = await obtenerConexion();

        const resultadoIds =
            await conexion.execute(`
                SELECT
                    (
                        SELECT NVL(
                            MAX(ID_PRODUCTO),
                            0
                        ) + 1
                        FROM PRODUCTO
                    ) AS "idProducto",

                    (
                        SELECT NVL(
                            MAX(ID_INVENTARIO),
                            0
                        ) + 1
                        FROM INVENTARIO
                    ) AS "idInventario"
                FROM DUAL
            `);

        const idProducto =
            resultadoIds.rows[0].idProducto;

        const idInventario =
            resultadoIds.rows[0].idInventario;

     
        const idUsuario = 1;

        await conexion.execute(
            `
            INSERT INTO PRODUCTO (
                ID_PRODUCTO,
                ID_USUARIO,
                ID_ESTADO,
                NOMBRE,
                DESCRIPCION,
                PRECIO
            )
            VALUES (
                :idProducto,
                :idUsuario,
                :estado,
                :nombre,
                :descripcion,
                :precio
            )
            `,
            {
                idProducto,
                idUsuario,
                estado,
                nombre,
                descripcion,
                precio
            },
            {
                autoCommit: false
            }
        );

        await conexion.execute(
            `
            INSERT INTO INVENTARIO (
                ID_INVENTARIO,
                ID_PRODUCTO,
                ID_ESTADO,
                CANTIDAD
            )
            VALUES (
                :idInventario,
                :idProducto,
                :estado,
                :cantidad
            )
            `,
            {
                idInventario,
                idProducto,
                estado,
                cantidad
            },
            {
                autoCommit: false
            }
        );

        await conexion.commit();

        return res.status(201).json({
            correcto: true,
            mensaje:
                "Producto guardado correctamente.",
            producto: {
                idProducto,
                nombre,
                descripcion,
                precio,
                cantidad,
                estado
            }
        });
    } catch (error) {
        console.error(
            "Error al guardar producto:",
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
                "No se pudo guardar el producto.",
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


async function editarProducto(req, res) {
    let conexion;

    try {
        const idProducto = Number(
            req.params.id
        );

        if (
            !Number.isInteger(idProducto) ||
            idProducto <= 0
        ) {
            return res.status(400).json({
                correcto: false,
                mensaje:
                    "El identificador del producto no es válido."
            });
        }

        const validacion = validarProducto(
            req.body
        );

        if (validacion.error) {
            return res.status(400).json({
                correcto: false,
                mensaje: validacion.error
            });
        }

        const {
            nombre,
            descripcion,
            precio,
            cantidad,
            estado
        } = validacion.producto;

        conexion = await obtenerConexion();

        const resultadoProducto =
            await conexion.execute(
                `
                UPDATE PRODUCTO
                SET
                    NOMBRE = :nombre,
                    DESCRIPCION = :descripcion,
                    PRECIO = :precio,
                    ID_ESTADO = :estado
                WHERE ID_PRODUCTO = :idProducto
                `,
                {
                    nombre,
                    descripcion,
                    precio,
                    estado,
                    idProducto
                },
                {
                    autoCommit: false
                }
            );

        if (
            resultadoProducto.rowsAffected === 0
        ) {
            await conexion.rollback();

            return res.status(404).json({
                correcto: false,
                mensaje:
                    "El producto no existe."
            });
        }

        const resultadoInventario =
            await conexion.execute(
                `
                UPDATE INVENTARIO
                SET
                    CANTIDAD = :cantidad,
                    ID_ESTADO = :estado
                WHERE ID_PRODUCTO = :idProducto
                `,
                {
                    cantidad,
                    estado,
                    idProducto
                },
                {
                    autoCommit: false
                }
            );

        
        if (
            resultadoInventario.rowsAffected === 0
        ) {
            const resultadoId =
                await conexion.execute(`
                    SELECT
                        NVL(
                            MAX(ID_INVENTARIO),
                            0
                        ) + 1 AS "idInventario"
                    FROM INVENTARIO
                `);

            const idInventario =
                resultadoId.rows[0].idInventario;

            await conexion.execute(
                `
                INSERT INTO INVENTARIO (
                    ID_INVENTARIO,
                    ID_PRODUCTO,
                    ID_ESTADO,
                    CANTIDAD
                )
                VALUES (
                    :idInventario,
                    :idProducto,
                    :estado,
                    :cantidad
                )
                `,
                {
                    idInventario,
                    idProducto,
                    estado,
                    cantidad
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
                "Producto actualizado correctamente.",
            producto: {
                idProducto,
                nombre,
                descripcion,
                precio,
                cantidad,
                estado
            }
        });
    } catch (error) {
        console.error(
            "Error al editar producto:",
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
                "No se pudo actualizar el producto.",
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
    listarProductos,
    guardarProducto,
    editarProducto
};