const formularioPedido =
    document.getElementById(
        "formPedido"
    );

const contenedorFormularioPedido =
    document.getElementById(
        "formularioPedido"
    );

const tablaPedidos =
    document.getElementById(
        "tablaPedidos"
    );

const mensajePedido =
    document.getElementById(
        "mensajePedido"
    );

const tituloFormularioPedido =
    document.getElementById(
        "tituloFormularioPedido"
    );

const botonGuardarPedido =
    document.getElementById(
        "btnGuardarPedido"
    );

const clientePedido =
    document.getElementById(
        "clientePedido"
    );

const productoPedido =
    document.getElementById(
        "productoPedido"
    );

const cantidadPedido =
    document.getElementById(
        "cantidadPedido"
    );

const fechaPedido =
    document.getElementById(
        "fechaPedido"
    );

const estadoPedido =
    document.getElementById(
        "estadoPedido"
    );

const precioProductoPedido =
    document.getElementById(
        "precioProductoPedido"
    );

const existenciasProductoPedido =
    document.getElementById(
        "existenciasProductoPedido"
    );

const buscarPedido =
    document.getElementById(
        "buscarPedido"
    );


let idPedidoEditando = null;

let pedidosCargados = [];

let productosDisponibles = [];



document.addEventListener(
    "DOMContentLoaded",
    async function () {
        establecerFechaActual();

        await Promise.all([
            cargarClientes(),
            cargarProductosPedido()
        ]);

        await cargarPedidos();
    }
);


async function cargarPedidos() {
    try {
        const respuesta = await fetch(
            "/api/pedidos",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaPedido(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudieron cargar los pedidos."
            );
        }

        pedidosCargados =
            resultado.pedidos || [];

        mostrarPedidosEnTabla(
            pedidosCargados
        );
    } catch (error) {
        console.error(
            "Error cargando pedidos:",
            error
        );

        mostrarMensajePedido(
            error.message,
            "error"
        );
    }
}


async function cargarClientes() {
    try {
        const respuesta = await fetch(
            "/api/pedidos/clientes",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaPedido(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudieron cargar los clientes."
            );
        }

        clientePedido.innerHTML = `
            <option value="">
                Seleccione un cliente
            </option>
        `;

        const clientes =
            resultado.clientes || [];

        clientes.forEach(
            function (cliente) {
                const opcion =
                    document.createElement(
                        "option"
                    );

                opcion.value =
                    cliente.idUsuario;

                opcion.textContent =
                    cliente.nombreCompleto;

                clientePedido.appendChild(
                    opcion
                );
            }
        );
    } catch (error) {
        console.error(
            "Error cargando clientes:",
            error
        );

        mostrarMensajePedido(
            error.message,
            "error"
        );
    }
}


async function cargarProductosPedido() {
    try {
        const respuesta = await fetch(
            "/api/pedidos/productos",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaPedido(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudieron cargar los productos."
            );
        }

        productosDisponibles =
            resultado.productos || [];

        productoPedido.innerHTML = `
            <option value="">
                Seleccione un producto
            </option>
        `;

        productosDisponibles.forEach(
            function (producto) {
                const opcion =
                    document.createElement(
                        "option"
                    );

                opcion.value =
                    producto.idProducto;

                opcion.textContent =
                    `${producto.nombre} - ₡${formatearPrecioPedido(
                        producto.precio
                    )}`;

                productoPedido.appendChild(
                    opcion
                );
            }
        );
    } catch (error) {
        console.error(
            "Error cargando productos:",
            error
        );

        mostrarMensajePedido(
            error.message,
            "error"
        );
    }
}


function mostrarPedidosEnTabla(
    pedidos
) {
    tablaPedidos.innerHTML = "";

    if (pedidos.length === 0) {
        tablaPedidos.innerHTML = `
            <tr>
                <td colspan="8">
                    No hay pedidos registrados.
                </td>
            </tr>
        `;

        return;
    }

    pedidos.forEach(
        function (pedido) {
            agregarPedidoTabla(
                pedido
            );
        }
    );
}


function agregarPedidoTabla(pedido) {
    const fila =
        document.createElement("tr");

    const claseEstado =
        obtenerClaseEstado(
            Number(pedido.idEstado)
        );

    fila.innerHTML = `
        <td>
            ${escaparHTMLPedido(
                pedido.idPedido
            )}
        </td>

        <td>
            ${escaparHTMLPedido(
                pedido.cliente
            )}
        </td>

        <td>
            ${escaparHTMLPedido(
                pedido.producto
            )}
        </td>

        <td>
            ${escaparHTMLPedido(
                pedido.cantidad
            )}
        </td>

        <td>
            ₡${formatearPrecioPedido(
                pedido.precioUnitario
            )}
        </td>

        <td>
            ${formatearFechaPedido(
                pedido.fechaPedido
            )}
        </td>

        <td>
            <span class="badge ${claseEstado}">
                ${escaparHTMLPedido(
                    pedido.estado
                )}
            </span>
        </td>

        <td>
            <button
                type="button"
                class="btn btn-warning btn-sm btn-editar-pedido"
                data-id="${pedido.idPedido}"
            >
                <i class="fas fa-pen"></i>
                Editar
            </button>

            <button
                type="button"
                class="btn btn-danger btn-sm btn-eliminar-pedido"
                data-id="${pedido.idPedido}"
            >
                <i class="fas fa-trash"></i>
                Eliminar
            </button>
        </td>
    `;

    tablaPedidos.appendChild(fila);
}



if (formularioPedido) {
    formularioPedido.addEventListener(
        "submit",
        async function (evento) {
            evento.preventDefault();

            ocultarMensajePedido();

            const datos = {
                idUsuario:
                    clientePedido.value,

                idProducto:
                    productoPedido.value,

                cantidad:
                    cantidadPedido.value,

                fechaPedido:
                    fechaPedido.value,

                idEstado:
                    estadoPedido.value
            };

            if (
                !datos.idUsuario ||
                !datos.idProducto ||
                !datos.cantidad ||
                !datos.fechaPedido ||
                !datos.idEstado
            ) {
                mostrarMensajePedido(
                    "Complete todos los campos obligatorios.",
                    "error"
                );

                return;
            }

            if (
                Number(datos.cantidad) <= 0
            ) {
                mostrarMensajePedido(
                    "La cantidad debe ser mayor que cero.",
                    "error"
                );

                return;
            }

            const producto =
                obtenerProductoSeleccionado();

            if (
                producto &&
                Number(datos.cantidad) >
                    Number(
                        producto.existencias
                    )
            ) {
                mostrarMensajePedido(
                    `La cantidad supera las existencias disponibles: ${producto.existencias}.`,
                    "error"
                );

                return;
            }

            bloquearBotonPedido(true);

            try {
                const esEdicion =
                    idPedidoEditando !== null;

                const direccion =
                    esEdicion
                        ? `/api/pedidos/${idPedidoEditando}`
                        : "/api/pedidos";

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
                    await leerRespuestaPedido(
                        respuesta
                    );

                if (!respuesta.ok) {
                    throw new Error(
                        resultado.mensaje ||
                        resultado.error ||
                        "No se pudo guardar el pedido."
                    );
                }

                ocultarFormularioPedido();

                await cargarPedidos();

                mostrarMensajePedido(
                    resultado.mensaje ||
                    "Pedido guardado correctamente.",
                    "correcto"
                );
            } catch (error) {
                console.error(
                    "Error guardando pedido:",
                    error
                );

                mostrarMensajePedido(
                    error.message,
                    "error"
                );
            } finally {
                bloquearBotonPedido(
                    false
                );
            }
        }
    );
}



document.addEventListener(
    "click",
    async function (evento) {
        const botonEditar =
            evento.target.closest(
                ".btn-editar-pedido"
            );

        if (botonEditar) {
            const idPedido = Number(
                botonEditar.dataset.id
            );

            editarPedidoFormulario(
                idPedido
            );

            return;
        }

        const botonEliminar =
            evento.target.closest(
                ".btn-eliminar-pedido"
            );

        if (botonEliminar) {
            const idPedido = Number(
                botonEliminar.dataset.id
            );

            await eliminarPedido(
                idPedido
            );
        }
    }
);


function editarPedidoFormulario(
    idPedido
) {
    const pedido =
        pedidosCargados.find(
            function (item) {
                return (
                    Number(
                        item.idPedido
                    ) === idPedido
                );
            }
        );

    if (!pedido) {
        mostrarMensajePedido(
            "No se encontró el pedido seleccionado.",
            "error"
        );

        return;
    }

    idPedidoEditando = Number(
        pedido.idPedido
    );

    clientePedido.value = String(
        pedido.idUsuario
    );

    productoPedido.value = String(
        pedido.idProducto
    );

    cantidadPedido.value =
        pedido.cantidad;

    fechaPedido.value =
        pedido.fechaPedido;

   
    if (
        [3, 4, 5].includes(
            Number(pedido.idEstado)
        )
    ) {
        estadoPedido.value = String(
            pedido.idEstado
        );
    } else {
        estadoPedido.value = "3";
    }

    tituloFormularioPedido.textContent =
        "Editar pedido";

    botonGuardarPedido.innerHTML = `
        <i class="fas fa-save"></i>
        Actualizar pedido
    `;

    actualizarInformacionProducto();

    contenedorFormularioPedido.style.display =
        "block";

    contenedorFormularioPedido.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


async function eliminarPedido(
    idPedido
) {
    const confirmar = window.confirm(
        "¿Está seguro de eliminar este pedido?"
    );

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(
            `/api/pedidos/${idPedido}`,
            {
                method: "DELETE",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaPedido(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudo eliminar el pedido."
            );
        }

        if (
            Number(idPedidoEditando) ===
            Number(idPedido)
        ) {
            ocultarFormularioPedido();
        }

        await cargarPedidos();

        mostrarMensajePedido(
            resultado.mensaje ||
            "Pedido eliminado correctamente.",
            "correcto"
        );
    } catch (error) {
        console.error(
            "Error eliminando pedido:",
            error
        );

        mostrarMensajePedido(
            error.message,
            "error"
        );
    }
}



function mostrarFormularioPedido() {
    ocultarMensajePedido();

    idPedidoEditando = null;

    formularioPedido.reset();

    estadoPedido.value = "3";

    establecerFechaActual();

    limpiarInformacionProducto();

    tituloFormularioPedido.textContent =
        "Nuevo pedido";

    botonGuardarPedido.innerHTML = `
        <i class="fas fa-save"></i>
        Guardar pedido
    `;

    contenedorFormularioPedido.style.display =
        "block";
}


function ocultarFormularioPedido() {
    contenedorFormularioPedido.style.display =
        "none";

    idPedidoEditando = null;

    formularioPedido.reset();

    estadoPedido.value = "3";

    establecerFechaActual();

    limpiarInformacionProducto();

    tituloFormularioPedido.textContent =
        "Nuevo pedido";

    botonGuardarPedido.innerHTML = `
        <i class="fas fa-save"></i>
        Guardar pedido
    `;
}


productoPedido.addEventListener(
    "change",
    actualizarInformacionProducto
);


function actualizarInformacionProducto() {
    const producto =
        obtenerProductoSeleccionado();

    if (!producto) {
        limpiarInformacionProducto();
        return;
    }

    precioProductoPedido.textContent =
        `₡${formatearPrecioPedido(
            producto.precio
        )}`;

    existenciasProductoPedido.textContent =
        producto.existencias;
}


function obtenerProductoSeleccionado() {
    const idProducto = Number(
        productoPedido.value
    );

    return productosDisponibles.find(
        function (producto) {
            return (
                Number(
                    producto.idProducto
                ) === idProducto
            );
        }
    );
}


function limpiarInformacionProducto() {
    precioProductoPedido.textContent =
        "₡0";

    existenciasProductoPedido.textContent =
        "0";
}


function establecerFechaActual() {
    if (fechaPedido.value) {
        return;
    }

    const hoy = new Date();

    const anio =
        hoy.getFullYear();

    const mes = String(
        hoy.getMonth() + 1
    ).padStart(
        2,
        "0"
    );

    const dia = String(
        hoy.getDate()
    ).padStart(
        2,
        "0"
    );

    fechaPedido.value =
        `${anio}-${mes}-${dia}`;
}



if (buscarPedido) {
    buscarPedido.addEventListener(
        "input",
        function () {
            const texto =
                buscarPedido.value
                    .trim()
                    .toLowerCase();

            if (!texto) {
                mostrarPedidosEnTabla(
                    pedidosCargados
                );

                return;
            }

            const pedidosFiltrados =
                pedidosCargados.filter(
                    function (pedido) {
                        return (
                            String(
                                pedido.idPedido
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                pedido.cliente
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                pedido.producto
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                pedido.estado
                            )
                                .toLowerCase()
                                .includes(texto)
                        );
                    }
                );

            mostrarPedidosEnTabla(
                pedidosFiltrados
            );
        }
    );
}


function bloquearBotonPedido(
    bloquear
) {
    botonGuardarPedido.disabled =
        bloquear;

    if (bloquear) {
        botonGuardarPedido.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Guardando...
        `;

        return;
    }

    if (idPedidoEditando !== null) {
        botonGuardarPedido.innerHTML = `
            <i class="fas fa-save"></i>
            Actualizar pedido
        `;
    } else {
        botonGuardarPedido.innerHTML = `
            <i class="fas fa-save"></i>
            Guardar pedido
        `;
    }
}


function mostrarMensajePedido(
    texto,
    tipo
) {
    mensajePedido.textContent = texto;

    mensajePedido.style.display =
        "block";

    mensajePedido.style.padding =
        "12px";

    mensajePedido.style.marginBottom =
        "16px";

    mensajePedido.style.borderRadius =
        "6px";

    if (tipo === "correcto") {
        mensajePedido.style.backgroundColor =
            "#d4edda";

        mensajePedido.style.color =
            "#155724";

        mensajePedido.style.border =
            "1px solid #c3e6cb";
    } else {
        mensajePedido.style.backgroundColor =
            "#f8d7da";

        mensajePedido.style.color =
            "#721c24";

        mensajePedido.style.border =
            "1px solid #f5c6cb";
    }
}


function ocultarMensajePedido() {
    mensajePedido.style.display =
        "none";

    mensajePedido.textContent = "";
}


async function leerRespuestaPedido(
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


function formatearPrecioPedido(valor) {
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


function formatearFechaPedido(
    fecha
) {
    if (!fecha) {
        return "";
    }

    const partes =
        fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return (
        `${partes[2]}/` +
        `${partes[1]}/` +
        `${partes[0]}`
    );
}


function obtenerClaseEstado(
    idEstado
) {
    switch (idEstado) {
        case 3:
            return "badge-pendiente";

        case 4:
            return "badge-cancelado";

        case 5:
            return "badge-completado";

        case 1:
            return "badge-activo";

        default:
            return "";
    }
}


function escaparHTMLPedido(valor) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        valor === null ||
        valor === undefined
            ? ""
            : String(valor);

    return elemento.innerHTML;
}