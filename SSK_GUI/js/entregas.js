const formularioEntrega =
    document.getElementById(
        "formEntrega"
    );

const contenedorFormularioEntrega =
    document.getElementById(
        "formularioEntrega"
    );

const tablaEntregas =
    document.getElementById(
        "tablaEntregas"
    );

const mensajeEntrega =
    document.getElementById(
        "mensajeEntrega"
    );

const tituloFormularioEntrega =
    document.getElementById(
        "tituloFormularioEntrega"
    );

const botonGuardarEntrega =
    document.getElementById(
        "btnGuardarEntrega"
    );

const pedidoEntrega =
    document.getElementById(
        "pedidoEntrega"
    );

const repartidorEntrega =
    document.getElementById(
        "repartidorEntrega"
    );

const fechaEntrega =
    document.getElementById(
        "fechaEntrega"
    );

const estadoEntrega =
    document.getElementById(
        "estadoEntrega"
    );

const clienteEntrega =
    document.getElementById(
        "clienteEntrega"
    );

const productoEntrega =
    document.getElementById(
        "productoEntrega"
    );

const direccionEntrega =
    document.getElementById(
        "direccionEntrega"
    );

const buscarEntrega =
    document.getElementById(
        "buscarEntrega"
    );


let idEntregaEditando = null;

let entregasCargadas = [];

let pedidosDisponibles = [];


document.addEventListener(
    "DOMContentLoaded",
    async function () {
        establecerFechaEntregaActual();

        await Promise.all([
            cargarPedidosEntrega(),
            cargarRepartidores()
        ]);

        await cargarEntregas();
    }
);


async function cargarEntregas() {
    try {
        const respuesta = await fetch(
            "/api/entregas",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaEntrega(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudieron cargar las entregas."
            );
        }

        entregasCargadas =
            resultado.entregas || [];

        mostrarEntregasEnTabla(
            entregasCargadas
        );
    } catch (error) {
        console.error(
            "Error cargando entregas:",
            error
        );

        mostrarMensajeEntrega(
            error.message,
            "error"
        );
    }
}


async function cargarPedidosEntrega() {
    try {
        const respuesta = await fetch(
            "/api/entregas/pedidos",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaEntrega(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudieron cargar los pedidos."
            );
        }

        pedidosDisponibles =
            resultado.pedidos || [];

        pedidoEntrega.innerHTML = `
            <option value="">
                Seleccione un pedido
            </option>
        `;

        pedidosDisponibles.forEach(
            function (pedido) {
                const opcion =
                    document.createElement(
                        "option"
                    );

                opcion.value =
                    pedido.idDetallePedido;

                opcion.textContent =
                    `Pedido #${pedido.idPedido} — ${pedido.cliente} — ${pedido.producto}`;

                pedidoEntrega.appendChild(
                    opcion
                );
            }
        );
    } catch (error) {
        console.error(
            "Error cargando pedidos:",
            error
        );

        mostrarMensajeEntrega(
            error.message,
            "error"
        );
    }
}


async function cargarRepartidores() {
    try {
        const respuesta = await fetch(
            "/api/entregas/repartidores",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaEntrega(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudieron cargar los repartidores."
            );
        }

        repartidorEntrega.innerHTML = `
            <option value="">
                Seleccione un repartidor
            </option>
        `;

        const repartidores =
            resultado.repartidores || [];

        repartidores.forEach(
            function (repartidor) {
                const opcion =
                    document.createElement(
                        "option"
                    );

                opcion.value =
                    repartidor.idRepartidor;

                opcion.textContent =
                    repartidor.nombreCompleto;

                repartidorEntrega.appendChild(
                    opcion
                );
            }
        );
    } catch (error) {
        console.error(
            "Error cargando repartidores:",
            error
        );

        mostrarMensajeEntrega(
            error.message,
            "error"
        );
    }
}


function mostrarEntregasEnTabla(
    entregas
) {
    tablaEntregas.innerHTML = "";

    if (entregas.length === 0) {
        tablaEntregas.innerHTML = `
            <tr>
                <td colspan="9">
                    No hay entregas registradas.
                </td>
            </tr>
        `;

        return;
    }

    entregas.forEach(
        function (entrega) {
            agregarEntregaTabla(
                entrega
            );
        }
    );
}


function agregarEntregaTabla(entrega) {
    const fila =
        document.createElement("tr");

    const claseEstado =
        obtenerClaseEstadoEntrega(
            Number(entrega.idEstado)
        );

    fila.innerHTML = `
        <td>
            ${escaparHTMLEntrega(
                entrega.idEntrega
            )}
        </td>

        <td>
            #${escaparHTMLEntrega(
                entrega.idPedido
            )}
        </td>

        <td>
            ${escaparHTMLEntrega(
                entrega.cliente
            )}
        </td>

        <td>
            ${escaparHTMLEntrega(
                entrega.producto
            )}
        </td>

        <td>
            ${escaparHTMLEntrega(
                entrega.repartidor
            )}
        </td>

        <td>
            ${escaparHTMLEntrega(
                entrega.direccion
            )}
        </td>

        <td>
            ${formatearFechaEntrega(
                entrega.fechaEntrega
            )}
        </td>

        <td>
            <span class="badge ${claseEstado}">
                ${escaparHTMLEntrega(
                    entrega.estado
                )}
            </span>
        </td>

        <td>
            <button
                type="button"
                class="btn btn-warning btn-sm btn-editar-entrega"
                data-id="${entrega.idEntrega}"
            >
                <i class="fas fa-pen"></i>
                Editar
            </button>

            <button
                type="button"
                class="btn btn-danger btn-sm btn-eliminar-entrega"
                data-id="${entrega.idEntrega}"
            >
                <i class="fas fa-trash"></i>
                Eliminar
            </button>
        </td>
    `;

    tablaEntregas.appendChild(fila);
}


if (formularioEntrega) {
    formularioEntrega.addEventListener(
        "submit",
        async function (evento) {
            evento.preventDefault();

            ocultarMensajeEntrega();

            const datos = {
                idDetallePedido:
                    pedidoEntrega.value,

                idRepartidor:
                    repartidorEntrega.value,

                fechaEntrega:
                    fechaEntrega.value,

                idEstado:
                    estadoEntrega.value
            };

            if (
                !datos.idDetallePedido ||
                !datos.idRepartidor ||
                !datos.fechaEntrega ||
                !datos.idEstado
            ) {
                mostrarMensajeEntrega(
                    "Complete todos los campos obligatorios.",
                    "error"
                );

                return;
            }

            bloquearBotonEntrega(true);

            try {
                const esEdicion =
                    idEntregaEditando !== null;

                const direccion =
                    esEdicion
                        ? `/api/entregas/${idEntregaEditando}`
                        : "/api/entregas";

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
                    await leerRespuestaEntrega(
                        respuesta
                    );

                if (!respuesta.ok) {
                    throw new Error(
                        resultado.mensaje ||
                        resultado.error ||
                        "No se pudo guardar la entrega."
                    );
                }

                ocultarFormularioEntrega();

                await Promise.all([
                    cargarPedidosEntrega(),
                    cargarEntregas()
                ]);

                mostrarMensajeEntrega(
                    resultado.mensaje ||
                    "Entrega guardada correctamente.",
                    "correcto"
                );
            } catch (error) {
                console.error(
                    "Error guardando entrega:",
                    error
                );

                mostrarMensajeEntrega(
                    error.message,
                    "error"
                );
            } finally {
                bloquearBotonEntrega(
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
                ".btn-editar-entrega"
            );

        if (botonEditar) {
            const idEntrega = Number(
                botonEditar.dataset.id
            );

            editarEntregaFormulario(
                idEntrega
            );

            return;
        }

        const botonEliminar =
            evento.target.closest(
                ".btn-eliminar-entrega"
            );

        if (botonEliminar) {
            const idEntrega = Number(
                botonEliminar.dataset.id
            );

            await eliminarEntrega(
                idEntrega
            );
        }
    }
);


function editarEntregaFormulario(
    idEntrega
) {
    const entrega =
        entregasCargadas.find(
            function (item) {
                return (
                    Number(
                        item.idEntrega
                    ) === idEntrega
                );
            }
        );

    if (!entrega) {
        mostrarMensajeEntrega(
            "No se encontró la entrega seleccionada.",
            "error"
        );

        return;
    }

    idEntregaEditando = Number(
        entrega.idEntrega
    );


    let opcionPedido =
        pedidoEntrega.querySelector(
            `option[value="${entrega.idDetallePedido}"]`
        );

    if (!opcionPedido) {
        opcionPedido =
            document.createElement(
                "option"
            );

        opcionPedido.value =
            entrega.idDetallePedido;

        opcionPedido.textContent =
            `Pedido #${entrega.idPedido} — ${entrega.cliente} — ${entrega.producto}`;

        pedidoEntrega.appendChild(
            opcionPedido
        );
    }

    pedidoEntrega.value = String(
        entrega.idDetallePedido
    );

    repartidorEntrega.value = String(
        entrega.idRepartidor
    );

    fechaEntrega.value =
        entrega.fechaEntrega;

    if (
        [3, 4, 5].includes(
            Number(entrega.idEstado)
        )
    ) {
        estadoEntrega.value = String(
            entrega.idEstado
        );
    } else {
        estadoEntrega.value = "3";
    }

    
    clienteEntrega.textContent =
        entrega.cliente || "—";

    productoEntrega.textContent =
        entrega.producto || "—";

    direccionEntrega.textContent =
        entrega.direccion || "—";

    tituloFormularioEntrega.textContent =
        "Editar entrega";

    botonGuardarEntrega.innerHTML = `
        <i class="fas fa-save"></i>
        Actualizar entrega
    `;

    contenedorFormularioEntrega.style.display =
        "block";

    contenedorFormularioEntrega.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


async function eliminarEntrega(
    idEntrega
) {
    const confirmar = window.confirm(
        "¿Está seguro de eliminar esta entrega?"
    );

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(
            `/api/entregas/${idEntrega}`,
            {
                method: "DELETE",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

        const resultado =
            await leerRespuestaEntrega(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudo eliminar la entrega."
            );
        }

        if (
            Number(idEntregaEditando) ===
            Number(idEntrega)
        ) {
            ocultarFormularioEntrega();
        }

        await Promise.all([
            cargarPedidosEntrega(),
            cargarEntregas()
        ]);

        mostrarMensajeEntrega(
            resultado.mensaje ||
            "Entrega eliminada correctamente.",
            "correcto"
        );
    } catch (error) {
        console.error(
            "Error eliminando entrega:",
            error
        );

        mostrarMensajeEntrega(
            error.message,
            "error"
        );
    }
}


function mostrarFormularioEntrega() {
    ocultarMensajeEntrega();

    idEntregaEditando = null;

    formularioEntrega.reset();

    estadoEntrega.value = "3";

    establecerFechaEntregaActual();

    limpiarInformacionPedido();

    tituloFormularioEntrega.textContent =
        "Nueva entrega";

    botonGuardarEntrega.innerHTML = `
        <i class="fas fa-save"></i>
        Guardar entrega
    `;

    contenedorFormularioEntrega.style.display =
        "block";
}


function ocultarFormularioEntrega() {
    contenedorFormularioEntrega.style.display =
        "none";

    idEntregaEditando = null;

    formularioEntrega.reset();

    estadoEntrega.value = "3";

    establecerFechaEntregaActual();

    limpiarInformacionPedido();

    tituloFormularioEntrega.textContent =
        "Nueva entrega";

    botonGuardarEntrega.innerHTML = `
        <i class="fas fa-save"></i>
        Guardar entrega
    `;
}


pedidoEntrega.addEventListener(
    "change",
    actualizarInformacionPedido
);


function actualizarInformacionPedido() {
    const pedido =
        obtenerPedidoSeleccionado();

    if (!pedido) {
        limpiarInformacionPedido();
        return;
    }

    clienteEntrega.textContent =
        pedido.cliente || "—";

    productoEntrega.textContent =
        pedido.producto || "—";

    direccionEntrega.textContent =
        pedido.direccion || "—";
}


function obtenerPedidoSeleccionado() {
    const idDetallePedido = Number(
        pedidoEntrega.value
    );

    return pedidosDisponibles.find(
        function (pedido) {
            return (
                Number(
                    pedido.idDetallePedido
                ) === idDetallePedido
            );
        }
    );
}


function limpiarInformacionPedido() {
    clienteEntrega.textContent = "—";
    productoEntrega.textContent = "—";
    direccionEntrega.textContent = "—";
}


function establecerFechaEntregaActual() {
    if (fechaEntrega.value) {
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

    fechaEntrega.value =
        `${anio}-${mes}-${dia}`;
}


if (buscarEntrega) {
    buscarEntrega.addEventListener(
        "input",
        function () {
            const texto =
                buscarEntrega.value
                    .trim()
                    .toLowerCase();

            if (!texto) {
                mostrarEntregasEnTabla(
                    entregasCargadas
                );

                return;
            }

            const entregasFiltradas =
                entregasCargadas.filter(
                    function (entrega) {
                        return (
                            String(
                                entrega.idEntrega
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                entrega.idPedido
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                entrega.cliente
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                entrega.producto
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                entrega.repartidor
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                entrega.direccion
                            )
                                .toLowerCase()
                                .includes(texto) ||

                            String(
                                entrega.estado
                            )
                                .toLowerCase()
                                .includes(texto)
                        );
                    }
                );

            mostrarEntregasEnTabla(
                entregasFiltradas
            );
        }
    );
}


function bloquearBotonEntrega(
    bloquear
) {
    botonGuardarEntrega.disabled =
        bloquear;

    if (bloquear) {
        botonGuardarEntrega.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Guardando...
        `;

        return;
    }

    if (idEntregaEditando !== null) {
        botonGuardarEntrega.innerHTML = `
            <i class="fas fa-save"></i>
            Actualizar entrega
        `;
    } else {
        botonGuardarEntrega.innerHTML = `
            <i class="fas fa-save"></i>
            Guardar entrega
        `;
    }
}


function mostrarMensajeEntrega(
    texto,
    tipo
) {
    mensajeEntrega.textContent = texto;

    mensajeEntrega.style.display =
        "block";

    mensajeEntrega.style.padding =
        "12px";

    mensajeEntrega.style.marginBottom =
        "16px";

    mensajeEntrega.style.borderRadius =
        "6px";

    if (tipo === "correcto") {
        mensajeEntrega.style.backgroundColor =
            "#d4edda";

        mensajeEntrega.style.color =
            "#155724";

        mensajeEntrega.style.border =
            "1px solid #c3e6cb";
    } else {
        mensajeEntrega.style.backgroundColor =
            "#f8d7da";

        mensajeEntrega.style.color =
            "#721c24";

        mensajeEntrega.style.border =
            "1px solid #f5c6cb";
    }
}


function ocultarMensajeEntrega() {
    mensajeEntrega.style.display =
        "none";

    mensajeEntrega.textContent = "";
}


async function leerRespuestaEntrega(
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


function formatearFechaEntrega(fecha) {
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


function obtenerClaseEstadoEntrega(
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


function escaparHTMLEntrega(valor) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        valor === null ||
        valor === undefined
            ? ""
            : String(valor);

    return elemento.innerHTML;
}