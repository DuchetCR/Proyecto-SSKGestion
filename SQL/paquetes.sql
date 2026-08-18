-- Paquete 1: Gestión de usuarios
create or replace package pkg_usuarios as

    function obtener_nombre(p_id_usuario in number) return varchar2;
    function esta_activo(p_id_usuario in number) return varchar2;
    procedure activar(p_id_usuario in number);
    procedure desactivar(p_id_usuario in number);

end pkg_usuarios;
/

create or replace package body pkg_usuarios as

    function obtener_nombre(p_id_usuario in number) return varchar2 as
        v_nombre varchar2(200);
    begin
        select trim(nombre || ' ' || nvl(primer_apellido,'') || ' ' || nvl(segundo_apellido,''))
          into v_nombre
          from USUARIO
         where id_usuario = p_id_usuario;
        return v_nombre;
    exception
        when no_data_found then return 'No encontrado';
    end obtener_nombre;

    function esta_activo(p_id_usuario in number) return varchar2 as
        v_estado number;
    begin
        select id_estado into v_estado from USUARIO where id_usuario = p_id_usuario;
        if v_estado = 1 then return 'SI'; else return 'NO'; end if;
    exception
        when no_data_found then return 'NO';
    end esta_activo;

    procedure activar(p_id_usuario in number) as
    begin
        update USUARIO set id_estado = 1 where id_usuario = p_id_usuario;
        commit;
        dbms_output.put_line('Usuario ' || p_id_usuario || ' activado.');
    end activar;

    procedure desactivar(p_id_usuario in number) as
    begin
        update USUARIO set id_estado = 2 where id_usuario = p_id_usuario;
        commit;
        dbms_output.put_line('Usuario ' || p_id_usuario || ' desactivado.');
    end desactivar;

end pkg_usuarios;
/


-- Paquete 2: Gestión de productos
create or replace package pkg_productos as

    function obtener_nombre(p_id_producto in number) return varchar2;
    function obtener_precio(p_id_producto in number) return number;
    function obtener_stock(p_id_producto in number) return number;
    procedure desactivar(p_id_producto in number);

end pkg_productos;
/

create or replace package body pkg_productos as

    function obtener_nombre(p_id_producto in number) return varchar2 as
        v_nombre varchar2(100);
    begin
        select nombre into v_nombre from PRODUCTO where id_producto = p_id_producto;
        return v_nombre;
    exception
        when no_data_found then return 'No encontrado';
    end obtener_nombre;

    function obtener_precio(p_id_producto in number) return number as
        v_precio number;
    begin
        select precio into v_precio from PRODUCTO where id_producto = p_id_producto;
        return nvl(v_precio, 0);
    exception
        when no_data_found then return 0;
    end obtener_precio;

    function obtener_stock(p_id_producto in number) return number as
        v_cantidad number;
    begin
        select nvl(cantidad, 0) into v_cantidad
          from INVENTARIO
         where id_producto = p_id_producto and id_estado = 1;
        return v_cantidad;
    exception
        when no_data_found then return 0;
    end obtener_stock;

    procedure desactivar(p_id_producto in number) as
    begin
        update PRODUCTO   set id_estado = 6 where id_producto = p_id_producto;
        update INVENTARIO set id_estado = 6 where id_producto = p_id_producto;
        commit;
        dbms_output.put_line('Producto ' || p_id_producto || ' eliminado.');
    end desactivar;

end pkg_productos;
/


-- Paquete 3: Gestión de pedidos
create or replace package pkg_pedidos as

    function obtener_total(p_id_pedido in number) return number;
    function obtener_estado(p_id_pedido in number) return varchar2;
    procedure cancelar(p_id_pedido in number);
    procedure completar(p_id_pedido in number);

end pkg_pedidos;
/

create or replace package body pkg_pedidos as

    function obtener_total(p_id_pedido in number) return number as
        v_total number;
    begin
        select cantidad * precio_unitario into v_total
          from PEDIDO where id_pedido = p_id_pedido;
        return nvl(v_total, 0);
    exception
        when no_data_found then return 0;
    end obtener_total;

    function obtener_estado(p_id_pedido in number) return varchar2 as
        v_estado varchar2(50);
    begin
        select e.estado into v_estado
          from PEDIDO pe join ESTADO e on e.id_estado = pe.id_estado
         where pe.id_pedido = p_id_pedido;
        return v_estado;
    exception
        when no_data_found then return 'No encontrado';
    end obtener_estado;

    procedure cancelar(p_id_pedido in number) as
    begin
        update PEDIDO        set id_estado = 4 where id_pedido = p_id_pedido;
        update DETALLE_PEDIDO set id_estado = 4 where id_pedido = p_id_pedido;
        commit;
        dbms_output.put_line('Pedido ' || p_id_pedido || ' cancelado.');
    end cancelar;

    procedure completar(p_id_pedido in number) as
    begin
        update PEDIDO set id_estado = 5 where id_pedido = p_id_pedido;
        commit;
        dbms_output.put_line('Pedido ' || p_id_pedido || ' completado.');
    end completar;

end pkg_pedidos;
/


-- Paquete 4: Gestión de entregas
create or replace package pkg_entregas as

    function contar_pendientes return number;
    function contar_completadas return number;
    procedure completar(p_id_entrega in number);
    procedure eliminar(p_id_entrega in number);

end pkg_entregas;
/

create or replace package body pkg_entregas as

    function contar_pendientes return number as
        v_total number;
    begin
        select count(*) into v_total from ENTREGA where id_estado = 3;
        return v_total;
    end contar_pendientes;

    function contar_completadas return number as
        v_total number;
    begin
        select count(*) into v_total from ENTREGA where id_estado = 5;
        return v_total;
    end contar_completadas;

    procedure completar(p_id_entrega in number) as
    begin
        update ENTREGA set id_estado = 5 where id_entrega = p_id_entrega;
        commit;
        dbms_output.put_line('Entrega ' || p_id_entrega || ' completada.');
    end completar;

    procedure eliminar(p_id_entrega in number) as
    begin
        update ENTREGA set id_estado = 6 where id_entrega = p_id_entrega;
        commit;
        dbms_output.put_line('Entrega ' || p_id_entrega || ' eliminada.');
    end eliminar;

end pkg_entregas;
/


-- Paquete 5: Gestión de pagos
create or replace package pkg_pagos as

    function total_cobrado return number;
    function total_por_metodo(p_id_metodo in number) return number;
    procedure eliminar(p_id_pago in number);

end pkg_pagos;
/

create or replace package body pkg_pagos as

    function total_cobrado return number as
        v_total number;
    begin
        select nvl(sum(monto), 0) into v_total from PAGO where id_estado <> 6;
        return v_total;
    end total_cobrado;

    function total_por_metodo(p_id_metodo in number) return number as
        v_total number;
    begin
        select nvl(sum(monto), 0) into v_total
          from PAGO
         where id_metodo_de_pago = p_id_metodo and id_estado <> 6;
        return v_total;
    end total_por_metodo;

    procedure eliminar(p_id_pago in number) as
    begin
        update PAGO set id_estado = 6 where id_pago = p_id_pago;
        commit;
        dbms_output.put_line('Pago ' || p_id_pago || ' eliminado.');
    end eliminar;

end pkg_pagos;
/


-- Paquete 6: Gestión de facturas
create or replace package pkg_facturas as

    function total_facturado return number;
    function obtener_total(p_id_factura in number) return number;
    procedure eliminar(p_id_factura in number);

end pkg_facturas;
/

create or replace package body pkg_facturas as

    function total_facturado return number as
        v_total number;
    begin
        select nvl(sum(total), 0) into v_total from FACTURA where id_estado <> 6;
        return v_total;
    end total_facturado;

    function obtener_total(p_id_factura in number) return number as
        v_total number;
    begin
        select total into v_total from FACTURA where id_factura = p_id_factura;
        return nvl(v_total, 0);
    exception
        when no_data_found then return 0;
    end obtener_total;

    procedure eliminar(p_id_factura in number) as
    begin
        update FACTURA set id_estado = 6 where id_factura = p_id_factura;
        commit;
        dbms_output.put_line('Factura ' || p_id_factura || ' eliminada.');
    end eliminar;

end pkg_facturas;
/


-- Paquete 7: Reportes generales
create or replace package pkg_reportes as

    function total_ventas return number;
    function total_clientes_activos return number;
    function total_productos_activos return number;
    procedure resumen_general;

end pkg_reportes;
/

create or replace package body pkg_reportes as

    function total_ventas return number as
        v_total number;
    begin
        select nvl(sum(cantidad * precio_unitario), 0) into v_total
          from PEDIDO where id_estado = 5;
        return v_total;
    end total_ventas;

    function total_clientes_activos return number as
        v_total number;
    begin
        select count(*) into v_total
          from USUARIO where id_estado = 1 and id_tipo_usuario in (2, 3);
        return v_total;
    end total_clientes_activos;

    function total_productos_activos return number as
        v_total number;
    begin
        select count(*) into v_total from PRODUCTO where id_estado = 1;
        return v_total;
    end total_productos_activos;

    procedure resumen_general as
    begin
        dbms_output.put_line('=== Resumen SSK Gestión ===');
        dbms_output.put_line('Total ventas:      ₡' || total_ventas);
        dbms_output.put_line('Clientes activos:  '  || total_clientes_activos);
        dbms_output.put_line('Productos activos: '  || total_productos_activos);
    end resumen_general;

end pkg_reportes;
/


-- Paquete 8: Gestión de inventario
create or replace package pkg_inventario as

    function obtener_cantidad(p_id_producto in number) return number;
    function producto_sin_stock(p_id_producto in number) return varchar2;
    procedure actualizar_cantidad(p_id_producto in number, p_cantidad in number);

end pkg_inventario;
/

create or replace package body pkg_inventario as

    function obtener_cantidad(p_id_producto in number) return number as
        v_cantidad number;
    begin
        select nvl(cantidad, 0) into v_cantidad
          from INVENTARIO where id_producto = p_id_producto and id_estado = 1;
        return v_cantidad;
    exception
        when no_data_found then return 0;
    end obtener_cantidad;

    function producto_sin_stock(p_id_producto in number) return varchar2 as
        v_cantidad number;
    begin
        v_cantidad := obtener_cantidad(p_id_producto);
        if v_cantidad <= 0 then return 'SI'; else return 'NO'; end if;
    end producto_sin_stock;

    procedure actualizar_cantidad(p_id_producto in number, p_cantidad in number) as
    begin
        update INVENTARIO
           set cantidad = p_cantidad
         where id_producto = p_id_producto and id_estado = 1;
        commit;
        dbms_output.put_line('Inventario producto ' || p_id_producto || ' actualizado a ' || p_cantidad);
    end actualizar_cantidad;

end pkg_inventario;
/


-- Paquete 9: Gestión de clientes
create or replace package pkg_clientes as

    function contar_pedidos(p_id_usuario in number) return number;
    function obtener_nombre(p_id_usuario in number) return varchar2;
    procedure eliminar(p_id_usuario in number);

end pkg_clientes;
/

create or replace package body pkg_clientes as

    function contar_pedidos(p_id_usuario in number) return number as
        v_total number;
    begin
        select count(*) into v_total
          from PEDIDO where id_usuario = p_id_usuario and id_estado <> 6;
        return v_total;
    end contar_pedidos;

    function obtener_nombre(p_id_usuario in number) return varchar2 as
        v_nombre varchar2(200);
    begin
        select trim(nombre || ' ' || nvl(primer_apellido,'') || ' ' || nvl(segundo_apellido,''))
          into v_nombre from USUARIO where id_usuario = p_id_usuario;
        return v_nombre;
    exception
        when no_data_found then return 'No encontrado';
    end obtener_nombre;

    procedure eliminar(p_id_usuario in number) as
    begin
        update USUARIO   set id_estado = 6 where id_usuario = p_id_usuario;
        update CORREO    set id_estado = 6 where id_usuario = p_id_usuario;
        update TELEFONO  set id_estado = 6 where id_usuario = p_id_usuario;
        update DIRECCION set id_estado = 6 where id_usuario = p_id_usuario;
        commit;
        dbms_output.put_line('Cliente ' || p_id_usuario || ' eliminado.');
    end eliminar;

end pkg_clientes;
/


-- Paquete 10: Validaciones generales
create or replace package pkg_validaciones as

    function usuario_existe(p_id_usuario in number) return varchar2;
    function producto_existe(p_id_producto in number) return varchar2;
    function pedido_existe(p_id_pedido in number) return varchar2;

end pkg_validaciones;
/

create or replace package body pkg_validaciones as

    function usuario_existe(p_id_usuario in number) return varchar2 as
        v_count number;
    begin
        select count(*) into v_count
          from USUARIO where id_usuario = p_id_usuario and id_estado <> 6;
        if v_count > 0 then return 'SI'; else return 'NO'; end if;
    end usuario_existe;

    function producto_existe(p_id_producto in number) return varchar2 as
        v_count number;
    begin
        select count(*) into v_count
          from PRODUCTO where id_producto = p_id_producto and id_estado <> 6;
        if v_count > 0 then return 'SI'; else return 'NO'; end if;
    end producto_existe;

    function pedido_existe(p_id_pedido in number) return varchar2 as
        v_count number;
    begin
        select count(*) into v_count
          from PEDIDO where id_pedido = p_id_pedido and id_estado <> 6;
        if v_count > 0 then return 'SI'; else return 'NO'; end if;
    end pedido_existe;

end pkg_validaciones;
/