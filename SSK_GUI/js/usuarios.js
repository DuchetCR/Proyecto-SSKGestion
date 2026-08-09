const formularioUsuario =
    document.getElementById("formUsuario");

const tipoUsuario =
    document.getElementById("tipoUsuario");

const camposEmpleado =
    document.getElementById("camposEmpleado");

const puesto =
    document.getElementById("puesto");

const salario =
    document.getElementById("salario");

const mensajeUsuario =
    document.getElementById("mensajeUsuario");

const botonGuardar =
    document.getElementById("btnGuardarUsuario");

const tablaUsuarios =
    document.getElementById("tablaUsuarios");

const buscarUsuario =
    document.getElementById("buscarUsuario") ||
    document.querySelector(
        '.barra-busqueda input[placeholder*="Buscar usuario"]'
    );

let idUsuarioEditando = null;

let usuariosCargados = [];


document.addEventListener("DOMContentLoaded", function () {
    cargarUsuarios();
});


async function cargarUsuarios() {
    if (!tablaUsuarios) {
        console.error(
            "No se encontró el tbody con id tablaUsuarios."
        );

        return;
    }

    try {
        const respuesta = await fetch("/api/usuarios", {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        });

        const resultado = await leerRespuesta(respuesta);

        if (!respuesta.ok) {
            throw new Error(
                resultado.error ||
                resultado.mensaje ||
                "No se pudieron cargar los usuarios."
            );
        }

        usuariosCargados =
            resultado.usuarios || [];

        mostrarUsuariosEnTabla(
            usuariosCargados
        );
    } catch (error) {
        console.error(
            "Error al cargar los usuarios:",
            error
        );

        mostrarMensaje(
            error.message ||
            "No se pudieron cargar los usuarios.",
            "error"
        );
    }
}

function mostrarUsuariosEnTabla(usuarios) {
    if (!tablaUsuarios) {
        return;
    }

    tablaUsuarios.innerHTML = "";

    if (usuarios.length === 0) {
        mostrarFilaSinUsuarios();
        return;
    }

    usuarios.forEach(function (usuario) {
        agregarUsuarioTabla(usuario);
    });
}


if (buscarUsuario) {
    buscarUsuario.addEventListener(
        "input",
        function () {
            const texto =
                buscarUsuario.value
                    .trim()
                    .toLowerCase();

            if (!texto) {
                mostrarUsuariosEnTabla(
                    usuariosCargados
                );

                return;
            }

            const usuariosFiltrados =
                usuariosCargados.filter(
                    function (usuario) {
                        const nombreCompleto = [
                            usuario.nombre,
                            usuario.primerApellido,
                            usuario.segundoApellido
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();

                        return nombreCompleto.includes(
                            texto
                        );
                    }
                );

            mostrarUsuariosEnTabla(
                usuariosFiltrados
            );
        }
    );
}


if (tipoUsuario) {
    tipoUsuario.addEventListener("change", function () {
        actualizarCamposEmpleado();
    });
}


function actualizarCamposEmpleado() {
    if (
        !tipoUsuario ||
        !camposEmpleado ||
        !puesto ||
        !salario
    ) {
        return;
    }

    const esEmpleado = tipoUsuario.value === "4";

    camposEmpleado.style.display =
        esEmpleado ? "flex" : "none";

    puesto.required = esEmpleado;
    salario.required = esEmpleado;

    if (!esEmpleado) {
        puesto.value = "";
        salario.value = "";
    }
}

if (formularioUsuario) {
    formularioUsuario.addEventListener(
        "submit",
        async function (evento) {
            evento.preventDefault();

            ocultarMensaje();

            const datosUsuario = obtenerDatosFormulario();

            console.log(
                "Datos enviados al servidor:",
                datosUsuario
            );

            if (!validarUsuario(datosUsuario)) {
                return;
            }

            bloquearBotonGuardar(true);

            try {
                const esEdicion =
                    idUsuarioEditando !== null;

                const url = esEdicion
                    ? `/api/usuarios/${idUsuarioEditando}`
                    : "/api/usuarios";

                const metodo = esEdicion
                    ? "PUT"
                    : "POST";

                const respuesta = await fetch(
                    url,
                    {
                        method: metodo,
                        headers: {
                            "Content-Type":
                                "application/json",
                            Accept: "application/json"
                        },
                        body: JSON.stringify(datosUsuario)
                    }
                );

                const resultado =
                    await leerRespuesta(respuesta);

                console.log(
                    "Respuesta del servidor:",
                    resultado
                );

                if (!respuesta.ok) {
                    throw new Error(
                        resultado.error ||
                        resultado.mensaje ||
                        "No se pudo guardar el usuario."
                    );
                }

                if (!resultado.usuario) {
                    throw new Error(
                        "El servidor no devolvió los datos del usuario."
                    );
                }

            eliminarFilaSinUsuarios();

            mostrarMensaje(
                resultado.mensaje ||
                (
                    esEdicion
                        ? "Usuario actualizado correctamente."
                        : "Usuario guardado correctamente."
                ),
                "correcto"
            );

            await cargarUsuarios();

            salirModoEdicion();

            } catch (error) {
                console.error(
                    "Error al guardar el usuario:",
                    error
                );

                mostrarMensaje(
                    error.message ||
                    "No se pudo guardar el usuario.",
                    "error"
                );
            } finally {
                bloquearBotonGuardar(false);
            }
        }
    );
}


function obtenerDatosFormulario() {
    return {
        nombre: obtenerValor("nombre"),
        primerApellido:
            obtenerValor("primerApellido"),
        segundoApellido:
            obtenerValor("segundoApellido"),
        tipoUsuario:
            obtenerValor("tipoUsuario"),
        puesto:
            obtenerValor("puesto"),
        salario:
            obtenerValor("salario"),
        correo:
            obtenerValor("correo"),
        telefono:
            obtenerValor("telefono")
    };
}


function obtenerValor(idElemento) {
    const elemento =
        document.getElementById(idElemento);

    if (!elemento) {
        return "";
    }

    return elemento.value.trim();
}


function bloquearBotonGuardar(bloquear) {
    if (!botonGuardar) {
        return;
    }

    botonGuardar.disabled = bloquear;

    if (bloquear) {
    botonGuardar.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        ${
            idUsuarioEditando !== null
                ? "Actualizando..."
                : "Guardando..."
        }
    `;
    } else {
        actualizarTextoBotonGuardar();
    }
}

function validarUsuario(usuario) {
    if (!usuario.nombre) {
        mostrarMensaje(
            "Debe ingresar el nombre.",
            "error"
        );

        return false;
    }

    if (!usuario.primerApellido) {
        mostrarMensaje(
            "Debe ingresar el primer apellido.",
            "error"
        );

        return false;
    }

    if (!usuario.tipoUsuario) {
        mostrarMensaje(
            "Debe seleccionar el tipo de usuario.",
            "error"
        );

        return false;
    }

    if (!usuario.correo) {
        mostrarMensaje(
            "Debe ingresar el correo.",
            "error"
        );

        return false;
    }

    if (!validarCorreo(usuario.correo)) {
        mostrarMensaje(
            "El correo electrónico no es válido.",
            "error"
        );

        return false;
    }

    if (!usuario.telefono) {
        mostrarMensaje(
            "Debe ingresar el teléfono.",
            "error"
        );

        return false;
    }

    if (usuario.tipoUsuario === "4") {
        if (!usuario.puesto) {
            mostrarMensaje(
                "Debe seleccionar el puesto del empleado.",
                "error"
            );

            return false;
        }

        if (usuario.salario === "") {
            mostrarMensaje(
                "Debe ingresar el salario del empleado.",
                "error"
            );

            return false;
        }

        const salarioNumero =
            Number(usuario.salario);

        if (
            Number.isNaN(salarioNumero) ||
            salarioNumero < 0
        ) {
            mostrarMensaje(
                "El salario debe ser un número válido.",
                "error"
            );

            return false;
        }
    }

    return true;
}


function validarCorreo(correo) {
    const expresionCorreo =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return expresionCorreo.test(correo);
}

function agregarUsuarioTabla(usuario) {
    if (!tablaUsuarios) {
        return;
    }

    const fila = document.createElement("tr");

    fila.usuario = usuario;

    fila.dataset.idUsuario =
        usuario.idUsuario;

    const nombreCompleto = [
        usuario.nombre,
        usuario.primerApellido,
        usuario.segundoApellido
    ]
        .filter(Boolean)
        .join(" ");

    const nombreTipo =
        obtenerNombreTipo(
            String(usuario.tipoUsuario || "")
        );

    const nombrePuesto =
        usuario.puesto
            ? obtenerNombrePuesto(
                String(usuario.puesto)
            )
            : "—";

    fila.innerHTML = `
        <td>
            ${escaparHTML(usuario.idUsuario)}
        </td>

        <td>
            ${escaparHTML(nombreCompleto)}
        </td>

        <td>
            ${escaparHTML(nombreTipo)}
        </td>

        <td>
            ${escaparHTML(nombrePuesto)}
        </td>

        <td>
            ${escaparHTML(usuario.correo || "")}
        </td>

        <td>
            <span class="badge badge-activo">
                Activo
            </span>
        </td>

        <td>
            <button
                type="button"
                class="btn btn-warning btn-sm btn-editar-usuario"
                data-id="${escaparHTML(usuario.idUsuario)}"
            >
                <i class="fas fa-pen"></i>
                Editar
            </button>

            <button
                type="button"
                class="btn btn-danger btn-sm btn-eliminar-usuario"
                data-id="${escaparHTML(usuario.idUsuario)}"
            >
                <i class="fas fa-trash"></i>
                Eliminar
            </button>
        </td>
    `;

    tablaUsuarios.appendChild(fila);
}

document.addEventListener(
    "click",
    function (evento) {
        const botonEditar =
            evento.target.closest(
                ".btn-editar-usuario"
            );

        if (!botonEditar) {
            return;
        }

        evento.preventDefault();

        const fila =
            botonEditar.closest("tr");

        if (!fila || !fila.usuario) {
            mostrarMensaje(
                "No se encontraron los datos del usuario.",
                "error"
            );

            return;
        }

        cargarUsuarioEnFormulario(
            fila.usuario
        );
    }
);

function cargarUsuarioEnFormulario(usuario) {
    idUsuarioEditando =
        Number(usuario.idUsuario);

    asignarValor(
        "nombre",
        usuario.nombre
    );

    asignarValor(
        "primerApellido",
        usuario.primerApellido
    );

    asignarValor(
        "segundoApellido",
        usuario.segundoApellido
    );

    asignarValor(
        "tipoUsuario",
        usuario.tipoUsuario
    );

    actualizarCamposEmpleado();

    asignarValor(
        "puesto",
        usuario.puesto
    );

    asignarValor(
        "salario",
        usuario.salario
    );

    asignarValor(
        "correo",
        usuario.correo
    );

    asignarValor(
        "telefono",
        usuario.telefono
    );

    actualizarTextoBotonGuardar();

    if (
        typeof mostrarFormulario ===
        "function"
    ) {
        mostrarFormulario();
    }

    formularioUsuario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    mostrarMensaje(
        `Editando al usuario ${usuario.idUsuario}.`,
        "correcto"
    );
}

function asignarValor(idElemento, valor) {
    const elemento =
        document.getElementById(idElemento);

    if (!elemento) {
        return;
    }

    elemento.value =
        valor === null ||
        valor === undefined
            ? ""
            : String(valor);
}   

function actualizarTextoBotonGuardar() {
    if (!botonGuardar) {
        return;
    }

    botonGuardar.innerHTML =
        idUsuarioEditando !== null
            ? `
                <i class="fas fa-save"></i>
                Actualizar usuario
            `
            : `
                <i class="fas fa-save"></i>
                Guardar
            `;
}

function salirModoEdicion() {
    idUsuarioEditando = null;

    if (formularioUsuario) {
        formularioUsuario.reset();
    }

    actualizarCamposEmpleado();

    actualizarTextoBotonGuardar();
}

document.addEventListener(
    "click",
    async function (evento) {
        const botonEliminar =
            evento.target.closest(
                ".btn-eliminar-usuario"
            );

        if (!botonEliminar) {
            return;
        }

        evento.preventDefault();

        const idUsuario =
            Number(botonEliminar.dataset.id);

        if (
            !Number.isInteger(idUsuario) ||
            idUsuario <= 0
        ) {
            mostrarMensaje(
                "No se pudo identificar al usuario.",
                "error"
            );

            return;
        }

        const confirmar = window.confirm(
            "¿Está seguro de que desea eliminar este usuario?"
        );

        if (!confirmar) {
            return;
        }

        await eliminarUsuario(
            idUsuario,
            botonEliminar
        );
    }
);


async function eliminarUsuario(
    idUsuario,
    botonEliminar
) {
    const contenidoOriginal =
        botonEliminar.innerHTML;

    try {
        botonEliminar.disabled = true;

        botonEliminar.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Eliminando...
        `;

        const respuesta = await fetch(
            `/api/usuarios/${idUsuario}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json"
                }
            }
        );

        const resultado =
            await leerRespuesta(respuesta);

        console.log(
            "Respuesta al eliminar:",
            resultado
        );

        if (!respuesta.ok) {
            throw new Error(
                resultado.error ||
                resultado.mensaje ||
                "No se pudo eliminar el usuario."
            );
        }

        const fila =
            botonEliminar.closest("tr");

        if (fila) {
            fila.remove();
        }

        if (
            tablaUsuarios &&
            tablaUsuarios.children.length === 0
        ) {
            mostrarFilaSinUsuarios();
        }

        mostrarMensaje(
            resultado.mensaje ||
            "Usuario eliminado correctamente.",
            "correcto"
        );
    } catch (error) {
        console.error(
            "Error al eliminar el usuario:",
            error
        );

        mostrarMensaje(
            error.message ||
            "No se pudo eliminar el usuario.",
            "error"
        );

        botonEliminar.disabled = false;
        botonEliminar.innerHTML =
            contenidoOriginal;
    }
}

async function leerRespuesta(respuesta) {
    const textoRespuesta =
        await respuesta.text();

    if (!textoRespuesta) {
        return {};
    }

    try {
        return JSON.parse(textoRespuesta);
    } catch (error) {
        console.error(
            "Respuesta no válida:",
            textoRespuesta
        );

        throw new Error(
            "El servidor devolvió una respuesta inválida."
        );
    }
}


function obtenerNombreTipo(idTipo) {
    const tiposUsuario = {
        "1": "Administrador",
        "2": "Cliente Cartera",
        "3": "Cliente Convencional",
        "4": "Empleado"
    };

    return tiposUsuario[idTipo] || "Sin tipo";
}


function obtenerNombrePuesto(idPuesto) {
    const puestosUsuario = {
        "1": "Gerente General",
        "2": "Encargado de Facturación",
        "3": "Repartidor",
        "4": "Encargado de Pedidos",
        "5": "Asistente Administrativo"
    };

    return puestosUsuario[idPuesto] || "—";
}


function mostrarFilaSinUsuarios() {
    if (!tablaUsuarios) {
        return;
    }

    tablaUsuarios.innerHTML = `
        <tr id="filaSinUsuarios">
            <td colspan="7">
                No hay usuarios activos registrados.
            </td>
        </tr>
    `;
}


function eliminarFilaSinUsuarios() {
    const filaSinUsuarios =
        document.getElementById(
            "filaSinUsuarios"
        );

    if (filaSinUsuarios) {
        filaSinUsuarios.remove();
    }
}


function mostrarMensaje(texto, tipo) {
    if (!mensajeUsuario) {
        alert(texto);
        return;
    }

    mensajeUsuario.textContent = texto;
    mensajeUsuario.style.display = "block";
    mensajeUsuario.style.padding = "12px";
    mensajeUsuario.style.marginBottom = "16px";
    mensajeUsuario.style.borderRadius = "6px";

    if (tipo === "correcto") {
        mensajeUsuario.style.backgroundColor =
            "#d4edda";

        mensajeUsuario.style.color =
            "#155724";

        mensajeUsuario.style.border =
            "1px solid #c3e6cb";
    } else {
        mensajeUsuario.style.backgroundColor =
            "#f8d7da";

        mensajeUsuario.style.color =
            "#721c24";

        mensajeUsuario.style.border =
            "1px solid #f5c6cb";
    }
}


function ocultarMensaje() {
    if (!mensajeUsuario) {
        return;
    }

    mensajeUsuario.textContent = "";
    mensajeUsuario.style.display = "none";
}


function escaparHTML(valor) {
    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    const elemento =
        document.createElement("div");

    elemento.textContent =
        String(valor);

    return elemento.innerHTML;
}
