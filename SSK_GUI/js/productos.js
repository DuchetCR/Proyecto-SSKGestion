const formularioProducto =
    document.getElementById(
        "formProducto"
    );

const tablaProductos =
    document.getElementById(
        "tablaProductos"
    );

const mensajeProducto =
    document.getElementById(
        "mensajeProducto"
    );

const botonGuardarProducto =
    document.getElementById(
        "btnGuardarProducto"
    );

const tituloFormularioProducto =
    document.getElementById(
        "tituloFormularioProducto"
    );

const contenedorFormulario =
    document.getElementById(
        "formulario"
    );

const nombreProducto =
    document.getElementById(
        "nombreProducto"
    );

const precioProducto =
    document.getElementById(
        "precioProducto"
    );

const descripcionProducto =
    document.getElementById(
        "descripcionProducto"
    );

const cantidadProducto =
    document.getElementById(
        "cantidadProducto"
    );

const estadoProducto =
    document.getElementById(
        "estadoProducto"
    );


let idProductoEditando = null;
let productosCargados = [];


document.addEventListener(
    "DOMContentLoaded",
    function () {
        cargarProductos();
    }
);


async function cargarProductos() {
    if (!tablaProductos) {
        console.error(
            "No se encontró tablaProductos."
        );

        return;
    }

    try {
        const respuesta = await fetch(
            "/api/productos",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaProducto(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.error ||
                resultado.mensaje ||
                "No se pudieron cargar los productos."
            );
        }

        productosCargados =
            resultado.productos || [];

        mostrarProductosEnTabla(
            productosCargados
        );
    } catch (error) {
        console.error(
            "Error cargando productos:",
            error
        );

        mostrarMensajeProducto(
            error.message ||
            "No se pudieron cargar los productos.",
            "error"
        );
    }
}


function mostrarProductosEnTabla(
    productos
) {
    tablaProductos.innerHTML = "";

    if (productos.length === 0) {
        tablaProductos.innerHTML = `
            <tr>
                <td colspan="7">
                    No hay productos registrados.
                </td>
            </tr>
        `;

        return;
    }

    productos.forEach(
        function (producto) {
            agregarProductoTabla(
                producto
            );
        }
    );
}


function agregarProductoTabla(
    producto
) {
    const fila =
        document.createElement("tr");

    const productoActivo =
        Number(producto.estado) === 1;

    fila.innerHTML = `
        <td>
            ${escaparHTMLProducto(
                producto.idProducto
            )}
        </td>

        <td>
            ${escaparHTMLProducto(
                producto.nombre
            )}
        </td>

        <td>
            ${escaparHTMLProducto(
                producto.descripcion
            )}
        </td>

        <td>
            ₡${formatearPrecio(
                producto.precio
            )}
        </td>

        <td>
            ${escaparHTMLProducto(
                producto.cantidad
            )}
        </td>

        <td>
            <span class="badge ${
                productoActivo
                    ? "badge-activo"
                    : "badge-inactivo"
            }">
                ${
                    productoActivo
                        ? "Activo"
                        : "Inactivo"
                }
            </span>
        </td>

        <td>
            <button
                type="button"
                class="btn btn-warning btn-sm btn-editar-producto"
                data-id="${producto.idProducto}"
            >
                <i class="fas fa-pen"></i>
                Editar
            </button>
        </td>
    `;

    tablaProductos.appendChild(fila);
}


if (formularioProducto) {
    formularioProducto.addEventListener(
        "submit",
        async function (evento) {
            evento.preventDefault();

            ocultarMensajeProducto();

            const datos = {
                nombre:
                    nombreProducto.value.trim(),

                precio:
                    precioProducto.value,

                descripcion:
                    descripcionProducto.value.trim(),

                cantidad:
                    cantidadProducto.value,

                estado:
                    estadoProducto.value
            };

            if (
                !datos.nombre ||
                !datos.descripcion ||
                datos.precio === "" ||
                datos.cantidad === ""
            ) {
                mostrarMensajeProducto(
                    "Complete todos los campos obligatorios.",
                    "error"
                );

                return;
            }

            bloquearBotonProducto(true);

            try {
                const esEdicion =
                    idProductoEditando !== null;

                const direccion =
                    esEdicion
                        ? `/api/productos/${idProductoEditando}`
                        : "/api/productos";

                const metodo =
                    esEdicion
                        ? "PUT"
                        : "POST";

                const respuesta =
                    await fetch(
                        direccion,
                        {
                            method: metodo,
                            headers: {
                                "Content-Type":
                                    "application/json",

                                Accept:
                                    "application/json"
                            },
                            body:
                                JSON.stringify(
                                    datos
                                )
                        }
                    );

                const resultado =
                    await leerRespuestaProducto(
                        respuesta
                    );

                if (!respuesta.ok) {
                    throw new Error(
                        resultado.error ||
                        resultado.mensaje ||
                        "No se pudo guardar el producto."
                    );
                }

                
                ocultarFormulario();

                await cargarProductos();

                mostrarMensajeProducto(
                    resultado.mensaje ||
                    "Producto guardado correctamente.",
                    "correcto"
                );
            } catch (error) {
                console.error(
                    "Error guardando producto:",
                    error
                );

                mostrarMensajeProducto(
                    error.message ||
                    "No se pudo guardar el producto.",
                    "error"
                );
            } finally {
                bloquearBotonProducto(
                    false
                );
            }
        }
    );
}


document.addEventListener(
    "click",
    function (evento) {
        const botonEditar =
            evento.target.closest(
                ".btn-editar-producto"
            );

        if (!botonEditar) {
            return;
        }

        const idProducto = Number(
            botonEditar.dataset.id
        );

        const producto =
            productosCargados.find(
                function (item) {
                    return (
                        Number(
                            item.idProducto
                        ) === idProducto
                    );
                }
            );

        if (!producto) {
            mostrarMensajeProducto(
                "No se encontró el producto seleccionado.",
                "error"
            );

            return;
        }

        cargarProductoEnFormulario(
            producto
        );
    }
);


function cargarProductoEnFormulario(
    producto
) {
    idProductoEditando = Number(
        producto.idProducto
    );

    nombreProducto.value =
        producto.nombre || "";

    precioProducto.value =
        producto.precio ?? "";

    descripcionProducto.value =
        producto.descripcion || "";

    cantidadProducto.value =
        producto.cantidad ?? "";

    estadoProducto.value =
        String(
            producto.estado ?? 1
        );

    tituloFormularioProducto.textContent =
        "Editar producto";

    botonGuardarProducto.innerHTML = `
        <i class="fas fa-save"></i>
        Actualizar producto
    `;

    contenedorFormulario.style.display =
        "block";

    contenedorFormulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function mostrarFormulario() {
    ocultarMensajeProducto();

    idProductoEditando = null;

    formularioProducto.reset();

    estadoProducto.value = "1";

    tituloFormularioProducto.textContent =
        "Nuevo producto";

    botonGuardarProducto.innerHTML = `
        <i class="fas fa-save"></i>
        Guardar
    `;

    contenedorFormulario.style.display =
        "block";
}


function ocultarFormulario() {
    contenedorFormulario.style.display =
        "none";

    idProductoEditando = null;

    formularioProducto.reset();

    estadoProducto.value = "1";

    tituloFormularioProducto.textContent =
        "Nuevo producto";

    botonGuardarProducto.innerHTML = `
        <i class="fas fa-save"></i>
        Guardar
    `;
}


function bloquearBotonProducto(
    bloquear
) {
    botonGuardarProducto.disabled =
        bloquear;

    if (bloquear) {
        botonGuardarProducto.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Guardando...
        `;

        return;
    }

    if (idProductoEditando !== null) {
        botonGuardarProducto.innerHTML = `
            <i class="fas fa-save"></i>
            Actualizar producto
        `;
    } else {
        botonGuardarProducto.innerHTML = `
            <i class="fas fa-save"></i>
            Guardar
        `;
    }
}


function mostrarMensajeProducto(
    texto,
    tipo
) {
    if (!mensajeProducto) {
        return;
    }

    mensajeProducto.textContent = texto;

    mensajeProducto.style.display =
        "block";

    mensajeProducto.style.padding =
        "12px";

    mensajeProducto.style.marginBottom =
        "16px";

    mensajeProducto.style.borderRadius =
        "6px";

    if (tipo === "correcto") {
        mensajeProducto.style.backgroundColor =
            "#d4edda";

        mensajeProducto.style.color =
            "#155724";

        mensajeProducto.style.border =
            "1px solid #c3e6cb";
    } else {
        mensajeProducto.style.backgroundColor =
            "#f8d7da";

        mensajeProducto.style.color =
            "#721c24";

        mensajeProducto.style.border =
            "1px solid #f5c6cb";
    }
}


function ocultarMensajeProducto() {
    if (!mensajeProducto) {
        return;
    }

    mensajeProducto.style.display =
        "none";

    mensajeProducto.textContent = "";
}


async function leerRespuestaProducto(
    respuesta
) {
    const texto = await respuesta.text();

    if (!texto) {
        return {};
    }

    try {
        return JSON.parse(texto);
    } catch (error) {
        throw new Error(
            "El servidor devolvió una respuesta inválida."
        );
    }
}


function formatearPrecio(valor) {
    return Number(
        valor || 0
    ).toLocaleString(
        "es-CR",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );
}


function escaparHTMLProducto(valor) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        valor === null ||
        valor === undefined
            ? ""
            : String(valor);

    return elemento.innerHTML;
}