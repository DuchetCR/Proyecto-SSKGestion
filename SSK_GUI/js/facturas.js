const formularioFactura =
    document.getElementById(
        "formFactura"
    );

const contenedorFormularioFactura =
    document.getElementById(
        "formularioFactura"
    );

const tablaFacturas =
    document.getElementById(
        "tablaFacturas"
    );

const mensajeFactura =
    document.getElementById(
        "mensajeFactura"
    );

const tituloFormularioFactura =
    document.getElementById(
        "tituloFormularioFactura"
    );

const botonGuardarFactura =
    document.getElementById(
        "btnGuardarFactura"
    );

const pagoFactura =
    document.getElementById(
        "pagoFactura"
    );

const clienteFactura =
    document.getElementById(
        "clienteFactura"
    );

const productoFactura =
    document.getElementById(
        "productoFactura"
    );

const metodoFactura =
    document.getElementById(
        "metodoFactura"
    );

const montoPagoFactura =
    document.getElementById(
        "montoPagoFactura"
    );

const fechaFactura =
    document.getElementById(
        "fechaFactura"
    );

const totalFactura =
    document.getElementById(
        "totalFactura"
    );

const estadoFactura =
    document.getElementById(
        "estadoFactura"
    );

const buscarFactura =
    document.getElementById(
        "buscarFactura"
    );

const totalFacturado =
    document.getElementById(
        "totalFacturado"
    );

const facturasCompletadas =
    document.getElementById(
        "facturasCompletadas"
    );

const facturasPendientes =
    document.getElementById(
        "facturasPendientes"
    );


let idFacturaEditando = null;

let facturasCargadas = [];

let pagosDisponiblesFactura = [];


document.addEventListener(
    "DOMContentLoaded",
    async function () {
        establecerFechaFacturaActual();

        await cargarPagosFactura();

        await Promise.all([
            cargarFacturas(),
            cargarResumenFacturas()
        ]);
    }
);


async function cargarFacturas() {
    try {
        const respuesta = await fetch(
            "/api/facturas",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaFactura(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudieron cargar las facturas."
            );
        }

        facturasCargadas =
            resultado.facturas || [];

        mostrarFacturasEnTabla(
            facturasCargadas
        );
    } catch (error) {
        console.error(
            "Error cargando facturas:",
            error
        );

        mostrarMensajeFactura(
            error.message,
            "error"
        );
    }
}


async function cargarPagosFactura() {
    try {
        const respuesta = await fetch(
            "/api/facturas/pagos",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaFactura(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudieron cargar los pagos."
            );
        }

        pagosDisponiblesFactura =
            resultado.pagos || [];

        pagoFactura.innerHTML = `
            <option value="">
                Seleccione un pago
            </option>
        `;

        pagosDisponiblesFactura.forEach(
            function (pago) {
                const opcion =
                    document.createElement(
                        "option"
                    );

                opcion.value =
                    pago.idDetalleFactura;

                opcion.textContent =
                    `Pago #${pago.idPago} — Pedido #${pago.idPedido} — ${pago.cliente} — ₡${formatearMontoFactura(
                        pago.montoPago
                    )}`;

                pagoFactura.appendChild(
                    opcion
                );
            }
        );
    } catch (error) {
        console.error(
            "Error cargando pagos:",
            error
        );

        mostrarMensajeFactura(
            error.message,
            "error"
        );
    }
}


async function cargarResumenFacturas() {
    try {
        const respuesta = await fetch(
            "/api/facturas/resumen",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaFactura(
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
            resultado.resumen || {};

        totalFacturado.textContent =
            `₡${formatearMontoFactura(
                resumen.totalFacturado
            )}`;

        facturasCompletadas.textContent =
            Number(
                resumen.completadas || 0
            );

        facturasPendientes.textContent =
            Number(
                resumen.pendientes || 0
            );
    } catch (error) {
        console.error(
            "Error cargando resumen:",
            error
        );
    }
}


function mostrarFacturasEnTabla(
    facturas
) {
    tablaFacturas.innerHTML = "";

    if (facturas.length === 0) {
        tablaFacturas.innerHTML = `
            <tr>
                <td colspan="9">
                    No hay facturas registradas.
                </td>
            </tr>
        `;

        return;
    }

    facturas.forEach(
        function (factura) {
            agregarFacturaTabla(
                factura
            );
        }
    );
}


function agregarFacturaTabla(
    factura
) {
    const fila =
        document.createElement("tr");

    const claseEstado =
        obtenerClaseEstadoFactura(
            Number(factura.idEstado)
        );

    fila.innerHTML = `
        <td>
            ${escaparHTMLFactura(
                factura.idFactura
            )}
        </td>

        <td>
            #${escaparHTMLFactura(
                factura.idPedido
            )}
        </td>

        <td>
            #${escaparHTMLFactura(
                factura.idPago
            )}
        </td>

        <td>
            ${escaparHTMLFactura(
                factura.cliente
            )}
        </td>

        <td>
            ${escaparHTMLFactura(
                factura.producto || "—"
            )}
        </td>

        <td>
            ${formatearFechaFactura(
                factura.fechaPago
            )}
        </td>

        <td>
            ₡${formatearMontoFactura(
                factura.total
            )}
        </td>

        <td>
            <span class="badge ${claseEstado}">
                ${escaparHTMLFactura(
                    factura.estado
                )}
            </span>
        </td>

        <td>
            <button
                type="button"
                class="btn btn-warning btn-sm btn-editar-factura"
                data-id="${factura.idFactura}"
            >
                <i class="fas fa-pen"></i>
                Editar
            </button>

            <button
                type="button"
                class="btn btn-danger btn-sm btn-eliminar-factura"
                data-id="${factura.idFactura}"
            >
                <i class="fas fa-trash"></i>
                Eliminar
            </button>
        </td>
    `;

    tablaFacturas.appendChild(fila);
}


pagoFactura.addEventListener(
    "change",
    actualizarInformacionPagoFactura
);


function actualizarInformacionPagoFactura() {
    const pago =
        obtenerPagoFacturaSeleccionado();

    if (!pago) {
        limpiarInformacionPagoFactura();
        totalFactura.value = "";
        return;
    }

    clienteFactura.textContent =
        pago.cliente || "—";

    productoFactura.textContent =
        pago.producto || "—";

    metodoFactura.textContent =
        pago.metodoPago || "—";

    montoPagoFactura.textContent =
        `₡${formatearMontoFactura(
            pago.montoPago
        )}`;

    totalFactura.value =
        Number(pago.montoPago);
}


function obtenerPagoFacturaSeleccionado() {
    const idDetalleFactura = Number(
        pagoFactura.value
    );

    return pagosDisponiblesFactura.find(
        function (pago) {
            return (
                Number(
                    pago.idDetalleFactura
                ) === idDetalleFactura
            );
        }
    );
}


function limpiarInformacionPagoFactura() {
    clienteFactura.textContent = "—";
    productoFactura.textContent = "—";
    metodoFactura.textContent = "—";
    montoPagoFactura.textContent = "₡0";
}


formularioFactura.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();

        ocultarMensajeFactura();

        const datos = {
            idDetalleFactura:
                pagoFactura.value,

            fechaPago:
                fechaFactura.value,

            total:
                totalFactura.value,

            idEstado:
                estadoFactura.value
        };

        if (
            !datos.idDetalleFactura ||
            !datos.fechaPago ||
            !datos.total ||
            !datos.idEstado
        ) {
            mostrarMensajeFactura(
                "Seleccione un pago y complete todos los campos.",
                "error"
            );

            return;
        }

        if (
            Number(datos.total) <= 0
        ) {
            mostrarMensajeFactura(
                "El total debe ser mayor que cero.",
                "error"
            );

            return;
        }

        const pago =
            obtenerPagoFacturaSeleccionado();

        if (
            pago &&
            Number(datos.total) >
            Number(pago.montoPago)
        ) {
            mostrarMensajeFactura(
                "El total no puede superar el monto pagado.",
                "error"
            );

            return;
        }

        bloquearBotonFactura(true);

        try {
            const esEdicion =
                idFacturaEditando !== null;

            const direccion =
                esEdicion
                    ? `/api/facturas/${idFacturaEditando}`
                    : "/api/facturas";

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
                await leerRespuestaFactura(
                    respuesta
                );

            if (!respuesta.ok) {
                throw new Error(
                    resultado.mensaje ||
                    resultado.error ||
                    "No se pudo guardar la factura."
                );
            }

            ocultarFormularioFactura();

            await cargarPagosFactura();

            await Promise.all([
                cargarFacturas(),
                cargarResumenFacturas()
            ]);

            mostrarMensajeFactura(
                resultado.mensaje ||
                "Factura guardada correctamente.",
                "correcto"
            );
        } catch (error) {
            console.error(
                "Error guardando factura:",
                error
            );

            mostrarMensajeFactura(
                error.message,
                "error"
            );
        } finally {
            bloquearBotonFactura(false);
        }
    }
);


document.addEventListener(
    "click",
    async function (evento) {
        const botonEditar =
            evento.target.closest(
                ".btn-editar-factura"
            );

        if (botonEditar) {
            const idFactura = Number(
                botonEditar.dataset.id
            );

            editarFacturaFormulario(
                idFactura
            );

            return;
        }

        const botonEliminar =
            evento.target.closest(
                ".btn-eliminar-factura"
            );

        if (botonEliminar) {
            const idFactura = Number(
                botonEliminar.dataset.id
            );

            await eliminarFactura(
                idFactura
            );
        }
    }
);


function editarFacturaFormulario(
    idFactura
) {
    const factura =
        facturasCargadas.find(
            function (item) {
                return (
                    Number(
                        item.idFactura
                    ) === Number(idFactura)
                );
            }
        );

    if (!factura) {
        mostrarMensajeFactura(
            "No se encontró la factura seleccionada.",
            "error"
        );

        return;
    }

    idFacturaEditando = Number(
        factura.idFactura
    );

    let opcionPago =
        pagoFactura.querySelector(
            `option[value="${factura.idDetalleFactura}"]`
        );

    if (!opcionPago) {
        opcionPago =
            document.createElement(
                "option"
            );

        opcionPago.value =
            factura.idDetalleFactura;

        opcionPago.textContent =
            `Pago #${factura.idPago} — Pedido #${factura.idPedido} — ${factura.cliente}`;

        pagoFactura.appendChild(
            opcionPago
        );
    }

    pagoFactura.value = String(
        factura.idDetalleFactura
    );

    clienteFactura.textContent =
        factura.cliente || "—";

    productoFactura.textContent =
        factura.producto || "—";

    metodoFactura.textContent =
        factura.metodoPago || "—";

    montoPagoFactura.textContent =
        `₡${formatearMontoFactura(
            factura.montoPago
        )}`;

    fechaFactura.value =
        factura.fechaPago;

    totalFactura.value =
        factura.total;

    if (
        [3, 4, 5].includes(
            Number(factura.idEstado)
        )
    ) {
        estadoFactura.value = String(
            factura.idEstado
        );
    } else {
        estadoFactura.value = "5";
    }

    tituloFormularioFactura.textContent =
        "Editar factura";

    botonGuardarFactura.innerHTML = `
        <i class="fas fa-save"></i>
        Actualizar factura
    `;

    contenedorFormularioFactura.style.display =
        "block";

    contenedorFormularioFactura.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


async function eliminarFactura(
    idFactura
) {
    const confirmar = window.confirm(
        "¿Está seguro de eliminar esta factura?"
    );

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(
            `/api/facturas/${idFactura}`,
            {
                method: "DELETE",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaFactura(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudo eliminar la factura."
            );
        }

        if (
            Number(idFacturaEditando) ===
            Number(idFactura)
        ) {
            ocultarFormularioFactura();
        }

        await cargarPagosFactura();

        await Promise.all([
            cargarFacturas(),
            cargarResumenFacturas()
        ]);

        mostrarMensajeFactura(
            resultado.mensaje ||
            "Factura eliminada correctamente.",
            "correcto"
        );
    } catch (error) {
        console.error(
            "Error eliminando factura:",
            error
        );

        mostrarMensajeFactura(
            error.message,
            "error"
        );
    }
}


function mostrarFormularioFactura() {
    ocultarMensajeFactura();

    idFacturaEditando = null;

    formularioFactura.reset();

    limpiarInformacionPagoFactura();

    estadoFactura.value = "5";

    establecerFechaFacturaActual();

    tituloFormularioFactura.textContent =
        "Nueva factura";

    botonGuardarFactura.innerHTML = `
        <i class="fas fa-save"></i>
        Guardar factura
    `;

    contenedorFormularioFactura.style.display =
        "block";
}


function ocultarFormularioFactura() {
    contenedorFormularioFactura.style.display =
        "none";

    idFacturaEditando = null;

    formularioFactura.reset();

    limpiarInformacionPagoFactura();

    estadoFactura.value = "5";

    establecerFechaFacturaActual();

    tituloFormularioFactura.textContent =
        "Nueva factura";

    botonGuardarFactura.innerHTML = `
        <i class="fas fa-save"></i>
        Guardar factura
    `;
}


function establecerFechaFacturaActual() {
    if (fechaFactura.value) {
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

    fechaFactura.value =
        `${anio}-${mes}-${dia}`;
}


buscarFactura.addEventListener(
    "input",
    function () {
        const texto =
            buscarFactura.value
                .trim()
                .toLowerCase();

        if (!texto) {
            mostrarFacturasEnTabla(
                facturasCargadas
            );

            return;
        }

        const facturasFiltradas =
            facturasCargadas.filter(
                function (factura) {
                    return (
                        String(
                            factura.idFactura
                        )
                            .toLowerCase()
                            .includes(texto) ||

                        String(
                            factura.idPedido
                        )
                            .toLowerCase()
                            .includes(texto) ||

                        String(
                            factura.idPago
                        )
                            .toLowerCase()
                            .includes(texto) ||

                        String(
                            factura.cliente || ""
                        )
                            .toLowerCase()
                            .includes(texto) ||

                        String(
                            factura.producto || ""
                        )
                            .toLowerCase()
                            .includes(texto) ||

                        String(
                            factura.metodoPago || ""
                        )
                            .toLowerCase()
                            .includes(texto) ||

                        String(
                            factura.total
                        )
                            .toLowerCase()
                            .includes(texto) ||

                        String(
                            factura.estado || ""
                        )
                            .toLowerCase()
                            .includes(texto)
                    );
                }
            );

        mostrarFacturasEnTabla(
            facturasFiltradas
        );
    }
);


function bloquearBotonFactura(
    bloquear
) {
    botonGuardarFactura.disabled =
        bloquear;

    if (bloquear) {
        botonGuardarFactura.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Guardando...
        `;

        return;
    }

    if (idFacturaEditando !== null) {
        botonGuardarFactura.innerHTML = `
            <i class="fas fa-save"></i>
            Actualizar factura
        `;
    } else {
        botonGuardarFactura.innerHTML = `
            <i class="fas fa-save"></i>
            Guardar factura
        `;
    }
}


function mostrarMensajeFactura(
    texto,
    tipo
) {
    mensajeFactura.textContent = texto;

    mensajeFactura.style.display =
        "block";

    mensajeFactura.style.padding =
        "12px";

    mensajeFactura.style.marginBottom =
        "16px";

    mensajeFactura.style.borderRadius =
        "6px";

    if (tipo === "correcto") {
        mensajeFactura.style.backgroundColor =
            "#d4edda";

        mensajeFactura.style.color =
            "#155724";

        mensajeFactura.style.border =
            "1px solid #c3e6cb";
    } else {
        mensajeFactura.style.backgroundColor =
            "#f8d7da";

        mensajeFactura.style.color =
            "#721c24";

        mensajeFactura.style.border =
            "1px solid #f5c6cb";
    }
}


function ocultarMensajeFactura() {
    mensajeFactura.style.display =
        "none";

    mensajeFactura.textContent = "";
}


async function leerRespuestaFactura(
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


function formatearMontoFactura(valor) {
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


function formatearFechaFactura(fecha) {
    if (!fecha) {
        return "";
    }

    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return (
        `${partes[2]}/` +
        `${partes[1]}/` +
        `${partes[0]}`
    );
}


function obtenerClaseEstadoFactura(
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


function escaparHTMLFactura(valor) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        valor === null ||
        valor === undefined
            ? ""
            : String(valor);

    return elemento.innerHTML;
}