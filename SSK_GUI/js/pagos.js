const formularioPago =
    document.getElementById(
        "formPago"
    );

const contenedorFormularioPago =
    document.getElementById(
        "formularioPago"
    );

const tablaPagos =
    document.getElementById(
        "tablaPagos"
    );

const mensajePago =
    document.getElementById(
        "mensajePago"
    );

const tituloFormularioPago =
    document.getElementById(
        "tituloFormularioPago"
    );

const botonGuardarPago =
    document.getElementById(
        "btnGuardarPago"
    );

const pedidoPago =
    document.getElementById(
        "pedidoPago"
    );

const clientePago =
    document.getElementById(
        "clientePago"
    );

const productoPago =
    document.getElementById(
        "productoPago"
    );

const totalPedidoPago =
    document.getElementById(
        "totalPedidoPago"
    );

const metodoPago =
    document.getElementById(
        "metodoPago"
    );

const montoPago =
    document.getElementById(
        "montoPago"
    );

const estadoPago =
    document.getElementById(
        "estadoPago"
    );

const buscarPago =
    document.getElementById(
        "buscarPago"
    );

const totalEfectivo =
    document.getElementById(
        "totalEfectivo"
    );

const totalSinpe =
    document.getElementById(
        "totalSinpe"
    );

const totalTransferencia =
    document.getElementById(
        "totalTransferencia"
    );


let idPagoEditando = null;

let pagosCargados = [];

let pedidosDisponiblesPago = [];


document.addEventListener(
    "DOMContentLoaded",
    async function () {
        await Promise.all([
            cargarMetodosPago(),
            cargarPedidosPago()
        ]);

        await Promise.all([
            cargarPagos(),
            cargarResumenPagos()
        ]);
    }
);


async function cargarPedidosPago() {
    try {
        const respuesta = await fetch(
            "/api/pagos/pedidos",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaPago(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudieron cargar los pedidos."
            );
        }

        pedidosDisponiblesPago =
            resultado.pedidos || [];

        pedidoPago.innerHTML = `
            <option value="">
                Seleccione un pedido
            </option>
        `;

        pedidosDisponiblesPago.forEach(
            function (pedido) {
                const opcion =
                    document.createElement(
                        "option"
                    );

                opcion.value =
                    pedido.idPedido;

                opcion.textContent =
                    `Pedido #${pedido.idPedido} — ${pedido.cliente} — ₡${formatearMontoPago(
                        pedido.totalPedido
                    )}`;

                pedidoPago.appendChild(
                    opcion
                );
            }
        );
    } catch (error) {
        console.error(
            "Error cargando pedidos:",
            error
        );

        mostrarMensajePago(
            error.message,
            "error"
        );
    }
}


async function cargarMetodosPago() {
    try {
        const respuesta = await fetch(
            "/api/pagos/metodos",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaPago(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudieron cargar los métodos de pago."
            );
        }

        metodoPago.innerHTML = `
            <option value="">
                Seleccione un método
            </option>
        `;

        const metodos =
            resultado.metodos || [];

        metodos.forEach(
            function (metodo) {
                const opcion =
                    document.createElement(
                        "option"
                    );

                opcion.value =
                    metodo.idMetodoPago;

                opcion.textContent =
                    metodo.metodoPago;

                metodoPago.appendChild(
                    opcion
                );
            }
        );
    } catch (error) {
        console.error(
            "Error cargando métodos:",
            error
        );

        mostrarMensajePago(
            error.message,
            "error"
        );
    }
}


async function cargarPagos() {
    try {
        const respuesta = await fetch(
            "/api/pagos",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaPago(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudieron cargar los pagos."
            );
        }

        pagosCargados =
            resultado.pagos || [];

        mostrarPagosEnTabla(
            pagosCargados
        );
    } catch (error) {
        console.error(
            "Error cargando pagos:",
            error
        );

        mostrarMensajePago(
            error.message,
            "error"
        );
    }
}


async function cargarResumenPagos() {
    try {
        const respuesta = await fetch(
            "/api/pagos/resumen",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaPago(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudo cargar el resumen."
            );
        }

        const resumen =
            resultado.resumen || [];

        let efectivo = 0;
        let sinpe = 0;
        let transferencia = 0;

        resumen.forEach(
            function (item) {
                const nombre = String(
                    item.metodoPago || ""
                )
                    .trim()
                    .toLowerCase();

                if (nombre === "efectivo") {
                    efectivo =
                        Number(item.total);
                }

                if (
                    nombre.includes("sinpe")
                ) {
                    sinpe =
                        Number(item.total);
                }

                if (
                    nombre.includes(
                        "transferencia"
                    )
                ) {
                    transferencia =
                        Number(item.total);
                }
            }
        );

        totalEfectivo.textContent =
            `₡${formatearMontoPago(
                efectivo
            )}`;

        totalSinpe.textContent =
            `₡${formatearMontoPago(
                sinpe
            )}`;

        totalTransferencia.textContent =
            `₡${formatearMontoPago(
                transferencia
            )}`;
    } catch (error) {
        console.error(
            "Error cargando resumen:",
            error
        );
    }
}


function mostrarPagosEnTabla(pagos) {
    tablaPagos.innerHTML = "";

    if (pagos.length === 0) {
        tablaPagos.innerHTML = `
            <tr>
                <td colspan="8">
                    No hay pagos registrados.
                </td>
            </tr>
        `;

        return;
    }

    pagos.forEach(
        function (pago) {
            agregarPagoTabla(pago);
        }
    );
}


function agregarPagoTabla(pago) {
    const fila =
        document.createElement("tr");

    const claseEstado =
        obtenerClaseEstadoPago(
            Number(pago.idEstado)
        );

    fila.innerHTML = `
        <td>
            ${escaparHTMLPago(
                pago.idPago
            )}
        </td>

        <td>
            #${escaparHTMLPago(
                pago.idPedido
            )}
        </td>

        <td>
            ${escaparHTMLPago(
                pago.cliente
            )}
        </td>

        <td>
            ${escaparHTMLPago(
                pago.producto || "—"
            )}
        </td>

        <td>
            ${escaparHTMLPago(
                pago.metodoPago
            )}
        </td>

        <td>
            ₡${formatearMontoPago(
                pago.monto
            )}
        </td>

        <td>
            <span class="badge ${claseEstado}">
                ${escaparHTMLPago(
                    pago.estado
                )}
            </span>
        </td>

        <td>
            <button
                type="button"
                class="btn btn-warning btn-sm btn-editar-pago"
                data-id="${pago.idPago}"
            >
                <i class="fas fa-pen"></i>
                Editar
            </button>

            <button
                type="button"
                class="btn btn-danger btn-sm btn-eliminar-pago"
                data-id="${pago.idPago}"
            >
                <i class="fas fa-trash"></i>
                Eliminar
            </button>
        </td>
    `;

    tablaPagos.appendChild(fila);
}


pedidoPago.addEventListener(
    "change",
    actualizarInformacionPedidoPago
);


function actualizarInformacionPedidoPago() {
    const pedido =
        obtenerPedidoPagoSeleccionado();

    if (!pedido) {
        limpiarInformacionPedidoPago();
        montoPago.value = "";
        return;
    }

    clientePago.textContent =
        pedido.cliente || "—";

    productoPago.textContent =
        pedido.producto || "—";

    totalPedidoPago.textContent =
        `₡${formatearMontoPago(
            pedido.totalPedido
        )}`;

    montoPago.value =
        Number(pedido.totalPedido);
}


function obtenerPedidoPagoSeleccionado() {
    const idPedido = Number(
        pedidoPago.value
    );

    return pedidosDisponiblesPago.find(
        function (pedido) {
            return (
                Number(pedido.idPedido) ===
                idPedido
            );
        }
    );
}


function limpiarInformacionPedidoPago() {
    clientePago.textContent = "—";
    productoPago.textContent = "—";
    totalPedidoPago.textContent = "₡0";
}


formularioPago.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();

        ocultarMensajePago();

        const datos = {
            idPedido:
                pedidoPago.value,

            idMetodoPago:
                metodoPago.value,

            monto:
                montoPago.value,

            idEstado:
                estadoPago.value
        };

        if (
            !datos.idPedido ||
            !datos.idMetodoPago ||
            !datos.monto ||
            !datos.idEstado
        ) {
            mostrarMensajePago(
                "Seleccione el pedido y complete todos los campos.",
                "error"
            );

            return;
        }

        if (
            Number(datos.monto) <= 0
        ) {
            mostrarMensajePago(
                "El monto debe ser mayor que cero.",
                "error"
            );

            return;
        }

        const pedido =
            obtenerPedidoPagoSeleccionado();

        if (
            pedido &&
            Number(datos.monto) >
            Number(pedido.totalPedido)
        ) {
            mostrarMensajePago(
                "El monto no puede superar el total del pedido.",
                "error"
            );

            return;
        }

        bloquearBotonPago(true);

        try {
            const esEdicion =
                idPagoEditando !== null;

            const direccion =
                esEdicion
                    ? `/api/pagos/${idPagoEditando}`
                    : "/api/pagos";

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
                await leerRespuestaPago(
                    respuesta
                );

            if (!respuesta.ok) {
                throw new Error(
                    resultado.mensaje ||
                    resultado.error ||
                    "No se pudo guardar el pago."
                );
            }

            ocultarFormularioPago();

            await Promise.all([
                cargarPagos(),
                cargarResumenPagos()
            ]);

            mostrarMensajePago(
                resultado.mensaje ||
                "Pago guardado correctamente.",
                "correcto"
            );
        } catch (error) {
            console.error(
                "Error guardando pago:",
                error
            );

            mostrarMensajePago(
                error.message,
                "error"
            );
        } finally {
            bloquearBotonPago(false);
        }
    }
);


document.addEventListener(
    "click",
    async function (evento) {
        const botonEditar =
            evento.target.closest(
                ".btn-editar-pago"
            );

        if (botonEditar) {
            const idPago = Number(
                botonEditar.dataset.id
            );

            editarPagoFormulario(
                idPago
            );

            return;
        }

        const botonEliminar =
            evento.target.closest(
                ".btn-eliminar-pago"
            );

        if (botonEliminar) {
            const idPago = Number(
                botonEliminar.dataset.id
            );

            await eliminarPago(
                idPago
            );
        }
    }
);


function editarPagoFormulario(idPago) {
    const pago =
        pagosCargados.find(
            function (item) {
                return (
                    Number(item.idPago) ===
                    Number(idPago)
                );
            }
        );

    if (!pago) {
        mostrarMensajePago(
            "No se encontró el pago seleccionado.",
            "error"
        );

        return;
    }

    idPagoEditando = Number(
        pago.idPago
    );

    let opcionPedido =
        pedidoPago.querySelector(
            `option[value="${pago.idPedido}"]`
        );

    if (!opcionPedido) {
        opcionPedido =
            document.createElement(
                "option"
            );

        opcionPedido.value =
            pago.idPedido;

        opcionPedido.textContent =
            `Pedido #${pago.idPedido} — ${pago.cliente}`;

        pedidoPago.appendChild(
            opcionPedido
        );
    }

    pedidoPago.value = String(
        pago.idPedido
    );

    clientePago.textContent =
        pago.cliente || "—";

    productoPago.textContent =
        pago.producto || "—";

    const pedido =
        pedidosDisponiblesPago.find(
            function (item) {
                return (
                    Number(item.idPedido) ===
                    Number(pago.idPedido)
                );
            }
        );

    if (pedido) {
        totalPedidoPago.textContent =
            `₡${formatearMontoPago(
                pedido.totalPedido
            )}`;
    } else {
        totalPedidoPago.textContent =
            "No disponible";
    }

    metodoPago.value = String(
        pago.idMetodoPago
    );

    montoPago.value =
        pago.monto;

    if (
        [3, 4, 5].includes(
            Number(pago.idEstado)
        )
    ) {
        estadoPago.value = String(
            pago.idEstado
        );
    } else {
        estadoPago.value = "5";
    }

    tituloFormularioPago.textContent =
        "Editar pago";

    botonGuardarPago.innerHTML = `
        <i class="fas fa-save"></i>
        Actualizar pago
    `;

    contenedorFormularioPago.style.display =
        "block";

    contenedorFormularioPago.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


async function eliminarPago(idPago) {
    const confirmar = window.confirm(
        "¿Está seguro de eliminar este pago?"
    );

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(
            `/api/pagos/${idPago}`,
            {
                method: "DELETE",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaPago(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudo eliminar el pago."
            );
        }

        if (
            Number(idPagoEditando) ===
            Number(idPago)
        ) {
            ocultarFormularioPago();
        }

        await Promise.all([
            cargarPagos(),
            cargarResumenPagos()
        ]);

        mostrarMensajePago(
            resultado.mensaje ||
            "Pago eliminado correctamente.",
            "correcto"
        );
    } catch (error) {
        console.error(
            "Error eliminando pago:",
            error
        );

        mostrarMensajePago(
            error.message,
            "error"
        );
    }
}


function mostrarFormularioPago() {
    ocultarMensajePago();

    idPagoEditando = null;

    formularioPago.reset();

    limpiarInformacionPedidoPago();

    estadoPago.value = "5";

    tituloFormularioPago.textContent =
        "Registrar pago";

    botonGuardarPago.innerHTML = `
        <i class="fas fa-save"></i>
        Registrar pago
    `;

    contenedorFormularioPago.style.display =
        "block";
}


function ocultarFormularioPago() {
    contenedorFormularioPago.style.display =
        "none";

    idPagoEditando = null;

    formularioPago.reset();

    limpiarInformacionPedidoPago();

    estadoPago.value = "5";

    tituloFormularioPago.textContent =
        "Registrar pago";

    botonGuardarPago.innerHTML = `
        <i class="fas fa-save"></i>
        Registrar pago
    `;
}


if (buscarPago) {
    buscarPago.addEventListener(
        "input",
        function () {
            const texto =
                buscarPago.value
                    .trim()
                    .toLowerCase();

            if (!texto) {
                mostrarPagosEnTabla(
                    pagosCargados
                );

                return;
            }

            const pagosFiltrados =
                pagosCargados.filter(
                    function (pago) {
                        const cliente =
                            String(
                                pago.cliente || ""
                            ).toLowerCase();

                        const producto =
                            String(
                                pago.producto || ""
                            ).toLowerCase();

                        return (
                            cliente.includes(texto) ||
                            producto.includes(texto)
                        );
                    }
                );

            mostrarPagosEnTabla(
                pagosFiltrados
            );
        }
    );
}


function bloquearBotonPago(
    bloquear
) {
    botonGuardarPago.disabled =
        bloquear;

    if (bloquear) {
        botonGuardarPago.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Guardando...
        `;

        return;
    }

    if (idPagoEditando !== null) {
        botonGuardarPago.innerHTML = `
            <i class="fas fa-save"></i>
            Actualizar pago
        `;
    } else {
        botonGuardarPago.innerHTML = `
            <i class="fas fa-save"></i>
            Registrar pago
        `;
    }
}


function mostrarMensajePago(
    texto,
    tipo
) {
    mensajePago.textContent = texto;

    mensajePago.style.display =
        "block";

    mensajePago.style.padding =
        "12px";

    mensajePago.style.marginBottom =
        "16px";

    mensajePago.style.borderRadius =
        "6px";

    if (tipo === "correcto") {
        mensajePago.style.backgroundColor =
            "#d4edda";

        mensajePago.style.color =
            "#155724";

        mensajePago.style.border =
            "1px solid #c3e6cb";
    } else {
        mensajePago.style.backgroundColor =
            "#f8d7da";

        mensajePago.style.color =
            "#721c24";

        mensajePago.style.border =
            "1px solid #f5c6cb";
    }
}


function ocultarMensajePago() {
    mensajePago.style.display =
        "none";

    mensajePago.textContent = "";
}


async function leerRespuestaPago(
    respuesta
) {
    const texto =
        await respuesta.text();

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


function formatearMontoPago(valor) {
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


function obtenerClaseEstadoPago(
    idEstado
) {
    switch (idEstado) {
        case 3:
            return "badge-pendiente";

        case 4:
            return "badge-cancelado";

        case 5:
            return "badge-completado";

        default:
            return "";
    }
}


function escaparHTMLPago(valor) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        valor === null ||
        valor === undefined
            ? ""
            : String(valor);

    return elemento.innerHTML;
}
