-- 1. Listar todos los usuarios activos
declare
    cursor cur_usuarios is
        select id_usuario, nombre, primer_apellido, segundo_apellido
          from USUARIO
         where id_estado = 1;

    v_usuario cur_usuarios%rowtype;
begin

    dbms_output.put_line('=== Usuarios activos ===');
    open cur_usuarios;
    loop
        fetch cur_usuarios into v_usuario;
        exit when cur_usuarios%notfound;
        dbms_output.put_line(
            v_usuario.id_usuario || ' | ' ||
            v_usuario.nombre || ' ' ||
            nvl(v_usuario.primer_apellido, '') || ' ' ||
            nvl(v_usuario.segundo_apellido, '')
        );
    end loop;
    close cur_usuarios;

end;
/


-- 2. Listar todos los productos con su stock
declare
    cursor cur_productos is
        select p.id_producto, p.nombre, p.precio,
               nvl(i.cantidad, 0) as stock
          from PRODUCTO p
          left join INVENTARIO i on i.id_producto = p.id_producto
         where p.id_estado = 1;

    v_id_producto number;
    v_nombre      varchar2(100);
    v_precio      number;
    v_stock       number;
begin

    dbms_output.put_line('=== Productos activos ===');
    open cur_productos;
    loop
        fetch cur_productos into v_id_producto, v_nombre, v_precio, v_stock;
        exit when cur_productos%notfound;
        dbms_output.put_line(
            v_id_producto || ' | ' || v_nombre ||
            ' | ₡' || v_precio ||
            ' | Stock: ' || v_stock
        );
    end loop;
    close cur_productos;

end;
/


-- 3. Listar pedidos pendientes
declare
    cursor cur_pedidos_pendientes is
        select pe.id_pedido, pe.fecha_pedido,
               pe.cantidad, pe.precio_unitario
          from PEDIDO pe
         where pe.id_estado = 3;

    v_pedido cur_pedidos_pendientes%rowtype;
begin

    dbms_output.put_line('=== Pedidos pendientes ===');
    open cur_pedidos_pendientes;
    loop
        fetch cur_pedidos_pendientes into v_pedido;
        exit when cur_pedidos_pendientes%notfound;
        dbms_output.put_line(
            'Pedido: ' || v_pedido.id_pedido ||
            ' | Fecha: ' || v_pedido.fecha_pedido ||
            ' | Cantidad: ' || v_pedido.cantidad ||
            ' | Total: ₡' || (v_pedido.cantidad * v_pedido.precio_unitario)
        );
    end loop;
    close cur_pedidos_pendientes;

end;
/


-- 4. Listar entregas pendientes con nombre del repartidor
declare
    cursor cur_entregas is
        select e.id_entrega, e.fecha_entrega,
               u.nombre || ' ' || nvl(u.primer_apellido,'') as repartidor
          from ENTREGA e
          join USUARIO u on u.id_usuario = e.id_usuario
         where e.id_estado = 3;

    v_id_entrega   number;
    v_fecha        date;
    v_repartidor   varchar2(200);
begin

    dbms_output.put_line('=== Entregas pendientes ===');
    open cur_entregas;
    loop
        fetch cur_entregas into v_id_entrega, v_fecha, v_repartidor;
        exit when cur_entregas%notfound;
        dbms_output.put_line(
            'Entrega: ' || v_id_entrega ||
            ' | Fecha: ' || v_fecha ||
            ' | Repartidor: ' || v_repartidor
        );
    end loop;
    close cur_entregas;

end;
/


-- 5. Listar pagos con nombre del método de pago
declare
    cursor cur_pagos is
        select pa.id_pago, pa.monto, mp.metodo_de_pago
          from PAGO pa
          join METODO_DE_PAGO mp on mp.id_metodo_de_pago = pa.id_metodo_de_pago
         where pa.id_estado <> 6;

    v_id_pago      number;
    v_monto        number;
    v_metodo       varchar2(100);
begin

    dbms_output.put_line('=== Historial de pagos ===');
    open cur_pagos;
    loop
        fetch cur_pagos into v_id_pago, v_monto, v_metodo;
        exit when cur_pagos%notfound;
        dbms_output.put_line(
            'Pago: ' || v_id_pago ||
            ' | Método: ' || v_metodo ||
            ' | Monto: ₡' || v_monto
        );
    end loop;
    close cur_pagos;

end;
/


-- 6. Listar productos sin stock
declare
    cursor cur_sin_stock is
        select p.id_producto, p.nombre,
               nvl(i.cantidad, 0) as stock
          from PRODUCTO p
          left join INVENTARIO i on i.id_producto = p.id_producto
         where nvl(i.cantidad, 0) = 0
           and p.id_estado = 1;

    v_id_producto number;
    v_nombre      varchar2(100);
    v_stock       number;
begin

    dbms_output.put_line('=== Productos sin stock ===');
    open cur_sin_stock;
    loop
        fetch cur_sin_stock into v_id_producto, v_nombre, v_stock;
        exit when cur_sin_stock%notfound;
        dbms_output.put_line(
            v_id_producto || ' | ' || v_nombre ||
            ' | Stock: ' || v_stock
        );
    end loop;
    close cur_sin_stock;

end;
/


-- 7. Listar clientes con cantidad de pedidos
declare
    cursor cur_clientes is
        select u.id_usuario,
               trim(u.nombre || ' ' || nvl(u.primer_apellido,'')) as cliente,
               count(pe.id_pedido) as total_pedidos
          from USUARIO u
          left join PEDIDO pe on pe.id_usuario = u.id_usuario
                             and pe.id_estado <> 6
         where u.id_tipo_usuario in (2, 3)
           and u.id_estado = 1
         group by u.id_usuario, u.nombre, u.primer_apellido;

    v_id_usuario   number;
    v_cliente      varchar2(200);
    v_total        number;
begin

    dbms_output.put_line('=== Clientes y sus pedidos ===');
    open cur_clientes;
    loop
        fetch cur_clientes into v_id_usuario, v_cliente, v_total;
        exit when cur_clientes%notfound;
        dbms_output.put_line(
            v_id_usuario || ' | ' || v_cliente ||
            ' | Pedidos: ' || v_total
        );
    end loop;
    close cur_clientes;

end;
/


-- 8. Listar facturas completadas
declare
    cursor cur_facturas is
        select id_factura, fecha_pago, total
          from FACTURA
         where id_estado = 5
         order by fecha_pago;

    v_id_factura number;
    v_fecha      date;
    v_total      number;
begin

    dbms_output.put_line('=== Facturas completadas ===');
    open cur_facturas;
    loop
        fetch cur_facturas into v_id_factura, v_fecha, v_total;
        exit when cur_facturas%notfound;
        dbms_output.put_line(
            'Factura: ' || v_id_factura ||
            ' | Fecha: ' || v_fecha ||
            ' | Total: ₡' || v_total
        );
    end loop;
    close cur_facturas;

end;
/


-- 9. Cursor con parámetro: pedidos de un cliente específico
declare
    cursor cur_pedidos_cliente(p_id_usuario number) is
        select pe.id_pedido, pe.fecha_pedido,
               pe.cantidad, pe.precio_unitario
          from PEDIDO pe
         where pe.id_usuario = p_id_usuario
           and pe.id_estado  <> 6;

    v_pedido cur_pedidos_cliente%rowtype;
begin

    dbms_output.put_line('=== Pedidos del cliente 4 ===');
    open cur_pedidos_cliente(4);
    loop
        fetch cur_pedidos_cliente into v_pedido;
        exit when cur_pedidos_cliente%notfound;
        dbms_output.put_line(
            'Pedido: ' || v_pedido.id_pedido ||
            ' | Fecha: ' || v_pedido.fecha_pedido ||
            ' | Total: ₡' || (v_pedido.cantidad * v_pedido.precio_unitario)
        );
    end loop;
    close cur_pedidos_cliente;

end;
/


-- 10. Cursor con parámetro: inventario de un producto específico
declare
    cursor cur_inventario(p_id_producto number) is
        select i.id_inventario, i.cantidad, i.id_estado
          from INVENTARIO i
         where i.id_producto = p_id_producto;

    v_id_inventario number;
    v_cantidad      number;
    v_id_estado     number;
begin

    dbms_output.put_line('=== Inventario del producto 1 ===');
    open cur_inventario(1);
    loop
        fetch cur_inventario into v_id_inventario, v_cantidad, v_id_estado;
        exit when cur_inventario%notfound;
        dbms_output.put_line(
            'Inventario: ' || v_id_inventario ||
            ' | Cantidad: ' || v_cantidad ||
            ' | Estado: '   || v_id_estado
        );
    end loop;
    close cur_inventario;

end;
/


-- 11. Listar empleados de SSK
declare
    cursor cur_empleados is
        select u.id_usuario,
               trim(u.nombre || ' ' || nvl(u.primer_apellido,'')) as empleado,
               p.nombre_puesto,
               u.salario
          from USUARIO u
          join PUESTO p on p.id_puesto = u.id_puesto
         where u.id_tipo_usuario = 4
           and u.id_estado = 1;

    v_id       number;
    v_empleado varchar2(200);
    v_puesto   varchar2(100);
    v_salario  number;
begin

    dbms_output.put_line('=== Empleados SSK ===');
    open cur_empleados;
    loop
        fetch cur_empleados into v_id, v_empleado, v_puesto, v_salario;
        exit when cur_empleados%notfound;
        dbms_output.put_line(
            v_id || ' | ' || v_empleado ||
            ' | ' || v_puesto ||
            ' | ₡' || v_salario
        );
    end loop;
    close cur_empleados;

end;
/


-- 12. Listar pedidos completados con total
declare
    cursor cur_completados is
        select pe.id_pedido,
               trim(u.nombre || ' ' || nvl(u.primer_apellido,'')) as cliente,
               pe.cantidad * pe.precio_unitario as total
          from PEDIDO pe
          join USUARIO u on u.id_usuario = pe.id_usuario
         where pe.id_estado = 5;

    v_id_pedido number;
    v_cliente   varchar2(200);
    v_total     number;
begin

    dbms_output.put_line('=== Pedidos completados ===');
    open cur_completados;
    loop
        fetch cur_completados into v_id_pedido, v_cliente, v_total;
        exit when cur_completados%notfound;
        dbms_output.put_line(
            'Pedido: ' || v_id_pedido ||
            ' | Cliente: ' || v_cliente ||
            ' | Total: ₡' || v_total
        );
    end loop;
    close cur_completados;

end;
/


-- 13. Cursor FOR: listar métodos de pago con total cobrado
begin

    dbms_output.put_line('=== Total por método de pago ===');

    for reg in (
        select mp.metodo_de_pago,
               nvl(sum(pa.monto), 0) as total,
               count(pa.id_pago)     as cantidad
          from METODO_DE_PAGO mp
          left join PAGO pa on pa.id_metodo_de_pago = mp.id_metodo_de_pago
                           and pa.id_estado <> 6
         group by mp.metodo_de_pago
         order by total desc
    ) loop
        dbms_output.put_line(
            reg.metodo_de_pago ||
            ' | Pagos: ' || reg.cantidad ||
            ' | Total: ₡' || reg.total
        );
    end loop;

end;
/


-- 14. Cursor FOR: productos con bajo stock (menos de 10 unidades)
begin

    dbms_output.put_line('=== Productos con bajo stock ===');

    for reg in (
        select p.nombre,
               nvl(i.cantidad, 0) as stock
          from PRODUCTO p
          left join INVENTARIO i on i.id_producto = p.id_producto
         where nvl(i.cantidad, 0) < 10
           and p.id_estado = 1
         order by stock
    ) loop
        dbms_output.put_line(
            reg.nombre || ' | Stock: ' || reg.stock
        );
    end loop;

end;
/


-- 15. Cursor FOR: resumen de pedidos por estado
begin

    dbms_output.put_line('=== Pedidos por estado ===');

    for reg in (
        select e.estado,
               count(pe.id_pedido)                      as cantidad,
               nvl(sum(pe.cantidad * pe.precio_unitario), 0) as total
          from ESTADO e
          left join PEDIDO pe on pe.id_estado = e.id_estado
                             and pe.id_estado <> 6
         group by e.estado
         order by cantidad desc
    ) loop
        dbms_output.put_line(
            reg.estado ||
            ' | Cantidad: ' || reg.cantidad ||
            ' | Total: ₡'   || reg.total
        );
    end loop;

end;
/