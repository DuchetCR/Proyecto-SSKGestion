-- 1. Obtener nombre completo de un usuario
create or replace function obtener_nombre_usuario (
    p_id_usuario in number
) return varchar2
as
    v_nombre varchar2(200);
begin

    select nombre || ' ' ||
           nvl(primer_apellido, '') || ' ' ||
           nvl(segundo_apellido, '')
      into v_nombre
      from USUARIO
     where id_usuario = p_id_usuario;

    return trim(v_nombre);

exception
    when no_data_found then
        return 'Usuario no encontrado';

end obtener_nombre_usuario;
/


-- 2. Obtener el stock actual de un producto
create or replace function obtener_stock (
    p_id_producto in number
) return number
as
    v_cantidad number;
begin

    select nvl(cantidad, 0)
      into v_cantidad
      from INVENTARIO
     where id_producto = p_id_producto
       and id_estado   = 1;

    return v_cantidad;

exception
    when no_data_found then
        return 0;

end obtener_stock;
/



-- 3. Obtener el precio de un producto
create or replace function obtener_precio_producto (
    p_id_producto in number
) return number
as
    v_precio number;
begin

    select precio
      into v_precio
      from PRODUCTO
     where id_producto = p_id_producto
       and id_estado   = 1;

    return v_precio;

exception
    when no_data_found then
        return 0;

end obtener_precio_producto;
/


-- 4. Calcular el total de un pedido (cantidad x precio)
create or replace function calcular_total_pedido (
    p_id_pedido in number
) return number
as
    v_total number;
begin

    select pe.cantidad * pe.precio_unitario
      into v_total
      from PEDIDO pe
     where pe.id_pedido = p_id_pedido
       and pe.id_estado <> 6;

    return nvl(v_total, 0);

exception
    when no_data_found then
        return 0;

end calcular_total_pedido;
/


-- 5. Contar pedidos activos de un cliente
create or replace function contar_pedidos_cliente (
    p_id_usuario in number
) return number
as
    v_total number;
begin

    select count(*)
      into v_total
      from PEDIDO
     where id_usuario = p_id_usuario
       and id_estado  <> 6;

    return v_total;

end contar_pedidos_cliente;
/


-- 6. Verificar si un producto tiene stock suficiente
create or replace function tiene_stock_suficiente (
    p_id_producto in number,
    p_cantidad    in number
) return varchar2
as
    v_stock number;
begin

    v_stock := obtener_stock(p_id_producto);

    if v_stock >= p_cantidad then
        return 'SI';
    else
        return 'NO';
    end if;

end tiene_stock_suficiente;
/


-- 7. Obtener el estado de un pedido en texto
create or replace function obtener_estado_pedido (
    p_id_pedido in number
) return varchar2
as
    v_estado varchar2(50);
begin

    select e.estado
      into v_estado
      from PEDIDO pe
      join ESTADO e on e.id_estado = pe.id_estado
     where pe.id_pedido = p_id_pedido;

    return v_estado;

exception
    when no_data_found then
        return 'No encontrado';

end obtener_estado_pedido;
/


-- 8. Contar entregas pendientes
create or replace function contar_entregas_pendientes
return number
as
    v_total number;
begin

    select count(*)
      into v_total
      from ENTREGA
     where id_estado = 3;

    return v_total;

end contar_entregas_pendientes;
/


-- 9. Calcular total facturado por método de pago
create or replace function total_por_metodo_pago (
    p_id_metodo in number
) return number
as
    v_total number;
begin

    select nvl(sum(monto), 0)
      into v_total
      from PAGO
     where id_metodo_de_pago = p_id_metodo
       and id_estado         <> 6;

    return v_total;

end total_por_metodo_pago;
/


-- 10. Obtener nombre del método de pago
create or replace function obtener_metodo_pago (
    p_id_metodo in number
) return varchar2
as
    v_metodo varchar2(100);
begin

    select metodo_de_pago
      into v_metodo
      from METODO_DE_PAGO
     where id_metodo_de_pago = p_id_metodo;

    return v_metodo;

exception
    when no_data_found then
        return 'Método no encontrado';

end obtener_metodo_pago;
/


-- 11. Verificar si un usuario está activo
create or replace function usuario_activo (
    p_id_usuario in number
) return varchar2
as
    v_estado number;
begin

    select id_estado
      into v_estado
      from USUARIO
     where id_usuario = p_id_usuario;

    if v_estado = 1 then
        return 'SI';
    else
        return 'NO';
    end if;

exception
    when no_data_found then
        return 'NO';

end usuario_activo;
/


-- 12. Contar productos activos en catálogo
create or replace function contar_productos_activos
return number
as
    v_total number;
begin

    select count(*)
      into v_total
      from PRODUCTO
     where id_estado = 1;

    return v_total;

end contar_productos_activos;
/


-- 13. Obtener total de ventas del sistema
create or replace function total_ventas
return number
as
    v_total number;
begin

    select nvl(sum(cantidad * precio_unitario), 0)
      into v_total
      from PEDIDO
     where id_estado = 5;

    return v_total;

end total_ventas;
/


-- 14. Obtener nombre del producto
create or replace function obtener_nombre_producto (
    p_id_producto in number
) return varchar2
as
    v_nombre varchar2(100);
begin

    select nombre
      into v_nombre
      from PRODUCTO
     where id_producto = p_id_producto;

    return v_nombre;

exception
    when no_data_found then
        return 'Producto no encontrado';

end obtener_nombre_producto;
/


-- 15. Contar clientes activos
create or replace function contar_clientes_activos
return number
as
    v_total number;
begin

    select count(*)
      into v_total
      from USUARIO
     where id_estado        = 1
       and id_tipo_usuario in (2, 3);

    return v_total;

end contar_clientes_activos;
/