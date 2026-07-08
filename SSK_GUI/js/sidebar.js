// Genera el sidebar en todas las páginas
function cargarSidebar(paginaActiva) {
    const links = [
        { href: 'dashboard.html',  icono: '<i class="fas fa-chart-bar"></i>', texto: 'Dashboard'  },
        { href: 'usuarios.html',   icono: '<i class="fas fa-users"></i>', texto: 'Usuarios'   },
        { href: 'productos.html',  icono: '<i class="fas fa-box"></i>', texto: 'Productos'  },
        { href: 'pedidos.html',    icono: '<i class="fas fa-shopping-cart"></i>', texto: 'Pedidos'    },
        { href: 'entregas.html',   icono: '<i class="fas fa-truck"></i>', texto: 'Entregas'   },
        { href: 'pagos.html',      icono: '<i class="fas fa-credit-card"></i>', texto: 'Pagos'      },
        { href: 'facturas.html',   icono: '<i class="fas fa-file-invoice"></i>', texto: 'Facturas'   },
    ];

    const navItems = links.map(l => `
        <a href="${l.href}" class="${l.href === paginaActiva ? 'activo' : ''}">
            <span class="icono">${l.icono}</span> ${l.texto}
        </a>
    `).join('');

    return `
        <div class="sidebar">
            <div class="sidebar-logo">
                <h1>SSK<span style="color:#43A047">.</span></h1>
                <p>Gestión Comercial</p>
            </div>
            <nav>${navItems}</nav>
            <div class="sidebar-footer">
                <a href="login.html"><i class="fas fa-sign-out-alt"></i> Cerrar sesión</a>
            </div>
        </div>
    `;
}
