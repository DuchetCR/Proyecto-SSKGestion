-- Proyecto SC-504 | SSK Gestión
-- 25 Procedimientos Almacenados (INSERT, UPDATE, DELETE)


-- INSERCIONES (10)

-- 1. Insertar un nuevo usuario
create or replace procedure insertar_usuario (
    p_id_usuario       in number,
    p_id_tipo_usuario  in number,
    p_id_estado        in number,
    p_id_puesto        in number,
    p_nombre           in varchar2,
    p_primer_apellido  in varchar2,
    p_segundo_apellido in varchar2,
    p_salario          in number
)
as
begin

    insert into USUARIO (
        id_usuario, id_tipo_usuario, id_estado, id_puesto,
        nombre, primer_apellido, segundo_apellido, salario
    )
    values (
        p_id_usuario, p_id_tipo_usuario, p_id_estado, p_id_puesto,
        p_nombre, p_primer_apellido, p_segundo_apellido, p_salario
    );

    commit;
    dbms_output.put_line('Usuario ' || p_nombre || ' insertado correctamente.');

end insertar_usuario;
/


-- 2. Insertar correo de un usuario
create or replace procedure insertar_correo (
    p_id_usuario in number,
    p_id_estado  in number,
    p_correo     in varchar2
)
as
begin

    insert into CORREO (id_usuario, id_estado, correo)
    values (p_id_usuario, p_id_estado, p_correo);

    commit;
    dbms_output.put_line('Correo ' || p_correo || ' insertado correctamente.');

end insertar_correo;
/


-- 3. Insertar teléfono de un usuario
create or replace procedure insertar_telefono (
    p_id_usuario in number,
    p_id_estado  in number,
    p_telefono   in varchar2
)
as
begin

    insert into TELEFONO (id_usuario, id_estado, telefono)
    values (p_id_usuario, p_id_estado, p_telefono);

    commit;
    dbms_output.put_line('Telefono ' || p_telefono || ' insertado correctamente.');

end insertar_telefono;
/


-- 4. Insertar dirección de un usuario
create or replace procedure insertar_direccion (
    p_id_usuario  in number,
    p_id_estado   in number,
    p_id_distrito in number,
    p_otras_senas in varchar2
)
as
begin

    insert into DIRECCION (id_usuario, id_estado, id_Distrito, otras_senas)
    values (p_id_usuario, p_id_estado, p_id_distrito, p_otras_senas);

    commit;
    dbms_output.put_line('Direccion del usuario ' || p_id_usuario || ' insertada correctamente.');

end insertar_direccion;
/


-- 5. Insertar un producto nuevo
create or replace procedure insertar_producto (
    p_id_producto in number,
    p_id_usuario  in number,
    p_id_estado   in number,
    p_nombre      in varchar2,
    p_descripcion in varchar2,
    p_precio      in number
)
as
begin

    insert into PRODUCTO (id_producto, id_usuario, id_estado, nombre, descripcion, precio)
    values (p_id_producto, p_id_usuario, p_id_estado, p_nombre, p_descripcion, p_precio);

    commit;
    dbms_output.put_line('Producto ' || p_nombre || ' insertado correctamente.');

end insertar_producto;
/


-- 6. Insertar inventario para un producto
create or replace procedure insertar_inventario (
    p_id_inventario in number,
    p_id_producto   in number,
    p_id_estado     in number,
    p_cantidad      in number
)
as
begin

    insert into INVENTARIO (id_inventario, id_producto, id_estado, cantidad)
    values (p_id_inventario, p_id_producto, p_id_estado, p_cantidad);

    commit;
    dbms_output.put_line('Inventario para producto ' || p_id_producto || ' insertado correctamente.');

end insertar_inventario;
/


-- 7. Insertar un pedido
create or replace procedure insertar_pedido (
    p_id_pedido         in number,
    p_id_usuario        in number,
    p_id_estado         in number,
    p_fecha_pedido      in date,
    p_cantidad          in number,
    p_precio_unitario   in number,
    p_id_detalle_pedido in number,
    p_id_producto       in number
)
as
begin
 
    insert into PEDIDO (
        id_pedido, id_usuario, id_estado,
        fecha_pedido, cantidad, precio_unitario
    )
    values (
        p_id_pedido, p_id_usuario, p_id_estado,
        p_fecha_pedido, p_cantidad, p_precio_unitario
    );
 
    insert into DETALLE_PEDIDO (
        id_detalle_pedido, id_pedido, id_producto, id_estado, cantidad
    )
    values (
        p_id_detalle_pedido, p_id_pedido, p_id_producto, p_id_estado, p_cantidad
    );
 
    commit;
    dbms_output.put_line('Pedido ' || p_id_pedido || ' insertado correctamente.');
 
end insertar_pedido;
/

-- 8. Insertar un pago
create or replace procedure insertar_pago (
    p_id_pago           in number,
    p_id_metodo_de_pago in number,
    p_id_estado         in number,
    p_monto             in number
)
as
begin

    insert into PAGO (id_pago, id_metodo_de_pago, id_estado, monto)
    values (p_id_pago, p_id_metodo_de_pago, p_id_estado, p_monto);

    commit;
    dbms_output.put_line('Pago ' || p_id_pago || ' por monto ' || p_monto || ' insertado correctamente.');

end insertar_pago;
/


-- 9. Insertar una factura
create or replace procedure insertar_factura (
    p_id_factura in number,
    p_id_estado  in number,
    p_fecha_pago in date,
    p_total      in number
)
as
begin

    insert into FACTURA (id_factura, id_detalle_factura, id_estado, fecha_pago, total)
    values (p_id_factura, null, p_id_estado, p_fecha_pago, p_total);

    commit;
    dbms_output.put_line('Factura ' || p_id_factura || ' insertada correctamente.');

end insertar_factura;
/


-- 10. Insertar una entrega
create or replace procedure insertar_entrega (
    p_id_entrega        in number,
    p_id_direccion      in number,
    p_id_usuario        in number,
    p_id_detalle_pedido in number,
    p_id_estado         in number,
    p_fecha_entrega     in date
)
as
begin

    insert into ENTREGA (
        id_entrega, id_direccion, id_usuario,
        id_detalle_pedido, id_estado, fecha_entrega
    )
    values (
        p_id_entrega, p_id_direccion, p_id_usuario,
        p_id_detalle_pedido, p_id_estado, p_fecha_entrega
    );

    commit;
    dbms_output.put_line('Entrega ' || p_id_entrega || ' insertada correctamente.');

end insertar_entrega;
/


-- ACTUALIZACIONES (10)

-- 11. Actualizar nombre y apellidos de un usuario
create or replace procedure actualizar_nombre_usuario (
    p_id_usuario       in number,
    p_nombre           in varchar2,
    p_primer_apellido  in varchar2,
    p_segundo_apellido in varchar2
)
as
begin

    update USUARIO
       set nombre           = p_nombre,
           primer_apellido  = p_primer_apellido,
           segundo_apellido = p_segundo_apellido
     where id_usuario = p_id_usuario;

    commit;
    dbms_output.put_line('Nombre del usuario ' || p_id_usuario || ' actualizado correctamente.');

end actualizar_nombre_usuario;
/


-- 12. Actualizar salario de un empleado
create or replace procedure actualizar_salario (
    p_id_usuario in number,
    p_salario    in number
)
as
begin

    update USUARIO
       set salario = p_salario
     where id_usuario = p_id_usuario;

    commit;
    dbms_output.put_line('Salario del usuario ' || p_id_usuario || ' actualizado a ' || p_salario || '.');

end actualizar_salario;
/


-- 13. Actualizar estado de un usuario
create or replace procedure actualizar_estado_usuario (
    p_id_usuario in number,
    p_id_estado  in number
)
as
begin

    update USUARIO
       set id_estado = p_id_estado
     where id_usuario = p_id_usuario;

    commit;
    dbms_output.put_line('Estado del usuario ' || p_id_usuario || ' actualizado correctamente.');

end actualizar_estado_usuario;
/


-- 14. Actualizar correo de un usuario
create or replace procedure actualizar_correo (
    p_id_usuario in number,
    p_correo     in varchar2
)
as
begin

    update CORREO
       set correo = p_correo
     where id_usuario = p_id_usuario;

    commit;
    dbms_output.put_line('Correo del usuario ' || p_id_usuario || ' actualizado a ' || p_correo || '.');

end actualizar_correo;
/


-- 15. Actualizar teléfono de un usuario
create or replace procedure actualizar_telefono (
    p_id_usuario in number,
    p_telefono   in varchar2
)
as
begin

    update TELEFONO
       set telefono = p_telefono
     where id_usuario = p_id_usuario;

    commit;
    dbms_output.put_line('Telefono del usuario ' || p_id_usuario || ' actualizado a ' || p_telefono || '.');

end actualizar_telefono;
/


-- 16. Actualizar precio de un producto
create or replace procedure actualizar_precio_producto (
    p_id_producto in number,
    p_precio      in number
)
as
begin

    update PRODUCTO
       set precio = p_precio
     where id_producto = p_id_producto;

    commit;
    dbms_output.put_line('Precio del producto ' || p_id_producto || ' actualizado a ' || p_precio || '.');

end actualizar_precio_producto;
/


-- 17. Actualizar cantidad en inventario
create or replace procedure actualizar_inventario (
    p_id_producto in number,
    p_cantidad    in number
)
as
begin

    update INVENTARIO
       set cantidad = p_cantidad
     where id_producto = p_id_producto;

    commit;
    dbms_output.put_line('Inventario del producto ' || p_id_producto || ' actualizado a ' || p_cantidad || ' unidades.');

end actualizar_inventario;
/


-- 18. Actualizar estado de un pedido
create or replace procedure actualizar_estado_pedido (
    p_id_pedido in number,
    p_id_estado in number
)
as
begin

    update PEDIDO
       set id_estado = p_id_estado
     where id_pedido = p_id_pedido;

    commit;
    dbms_output.put_line('Estado del pedido ' || p_id_pedido || ' actualizado correctamente.');

end actualizar_estado_pedido;
/


-- 19. Actualizar estado de una entrega
create or replace procedure actualizar_estado_entrega (
    p_id_entrega in number,
    p_id_estado  in number
)
as
begin

    update ENTREGA
       set id_estado = p_id_estado
     where id_entrega = p_id_entrega;

    commit;
    dbms_output.put_line('Estado de la entrega ' || p_id_entrega || ' actualizado correctamente.');

end actualizar_estado_entrega;
/


-- 20. Actualizar fecha de entrega
create or replace procedure actualizar_fecha_entrega (
    p_id_entrega    in number,
    p_fecha_entrega in date
)
as
begin

    update ENTREGA
       set fecha_entrega = p_fecha_entrega
     where id_entrega = p_id_entrega;

    commit;
    dbms_output.put_line('Fecha de entrega ' || p_id_entrega || ' actualizada correctamente.');

end actualizar_fecha_entrega;
/


-- ELIMINACIONES LÓGICAS (5)

-- 21. Eliminar un usuario
create or replace procedure eliminar_usuario (
    p_id_usuario in number
)
as
begin

    update USUARIO
       set id_estado = 6
     where id_usuario = p_id_usuario;

    update CORREO
       set id_estado = 6
     where id_usuario = p_id_usuario;

    update TELEFONO
       set id_estado = 6
     where id_usuario = p_id_usuario;

    update DIRECCION
       set id_estado = 6
     where id_usuario = p_id_usuario;

    commit;
    dbms_output.put_line('Usuario ' || p_id_usuario || ' marcado como eliminado correctamente.');

end eliminar_usuario;
/


-- 22. Eliminar un producto
create or replace procedure eliminar_producto (
    p_id_producto in number
)
as
begin

    update PRODUCTO
       set id_estado = 6
     where id_producto = p_id_producto;

    update INVENTARIO
       set id_estado = 6
     where id_producto = p_id_producto;

    commit;
    dbms_output.put_line('Producto ' || p_id_producto || ' marcado como eliminado correctamente.');

end eliminar_producto;
/


-- 23. Eliminar un pedido y su detalle
create or replace procedure eliminar_pedido (
    p_id_pedido in number
)
as
begin

    update PEDIDO
       set id_estado = 6
     where id_pedido = p_id_pedido;

    update DETALLE_PEDIDO
       set id_estado = 6
     where id_pedido = p_id_pedido;

    commit;
    dbms_output.put_line('Pedido ' || p_id_pedido || ' marcado como eliminado correctamente.');

end eliminar_pedido;
/


-- 24. Eliminar un pago
create or replace procedure eliminar_pago (
    p_id_pago in number
)
as
begin

    update PAGO
       set id_estado = 6
     where id_pago = p_id_pago;

    commit;
    dbms_output.put_line('Pago ' || p_id_pago || ' marcado como eliminado correctamente.');

end eliminar_pago;
/


-- 25. Eliminar una entrega
create or replace procedure eliminar_entrega (
    p_id_entrega in number
)
as
begin

    update ENTREGA
       set id_estado = 6
     where id_entrega = p_id_entrega;

    commit;
    dbms_output.put_line('Entrega ' || p_id_entrega || ' marcada como eliminada correctamente.');

end eliminar_entrega;
/