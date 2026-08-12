SET SERVEROUTPUT ON;
--Al insertar un detalle de pedido reducir automáticamente el inventario
create or replace trigger trg_reducir_inventario
after insert on DETALLE_PEDIDO
for each row
begin
    update INVENTARIO
       set cantidad = NVL(cantidad, 0) - :NEW.cantidad
     where id_producto = :NEW.id_producto
       and id_estado   = 1;
        
    dbms_output.put_line(
        'Inventario reducido: producto ' || :NEW.id_producto ||
        ' | cantidad descontada: '       || :NEW.cantidad
    );

end trg_reducir_inventario;
/


--Al cancelar o eliminar lógicamente un pedido
--(estado 4 = Cancelado, 6 = Eliminado),devolver la cantidad al inventario
create or replace trigger trg_devolver_inventario
after update of id_estado on PEDIDO
for each row
begin

    if :NEW.id_estado in (4, 6) and :OLD.id_estado not in (4, 6) then

        update INVENTARIO i
           set i.cantidad = i.cantidad + (
               select dp.cantidad
                 from DETALLE_PEDIDO dp
                where dp.id_pedido = :NEW.id_pedido
                  and rownum = 1
           )
         where i.id_producto = (
               select dp.id_producto
                 from DETALLE_PEDIDO dp
                where dp.id_pedido = :NEW.id_pedido
                  and rownum = 1
           )
           and i.id_estado = 1;

        dbms_output.put_line(
            'Inventario devuelto por pedido ' || :NEW.id_pedido ||
            ' | estado nuevo: ' || :NEW.id_estado
        );

    end if;

end trg_devolver_inventario;
/


--Al insertar un usuario, ponerlo activo automáticamente (id_estado = 1)
create or replace trigger trg_usuario_activo
before insert on USUARIO
for each row
begin

    :NEW.id_estado := 1;

    dbms_output.put_line(
        'Usuario ' || :NEW.nombre || ' ' || :NEW.primer_apellido ||
        ' creado con estado Activo automáticamente.'
    );

end trg_usuario_activo;
/

--Al insertar un producto ponerlo activo automáticamente (id_estado = 1)
create or replace trigger trg_producto_activo
before insert on PRODUCTO
for each row
begin

    :NEW.id_estado := 1;

    dbms_output.put_line(
        'Producto ' || :NEW.nombre ||
        ' creado con estado Activo automáticamente.'
    );

end trg_producto_activo;
/


--Al actualizar el inventario a 0, marcar el producto como inactivo (id_estado = 2)
create or replace trigger trg_producto_sin_stock
after update of cantidad on INVENTARIO
for each row
begin

    if :NEW.cantidad <= 0 then

        update PRODUCTO
           set id_estado = 2
         where id_producto = :NEW.id_producto;

        dbms_output.put_line(
            'Producto ' || :NEW.id_producto ||
            ' marcado como inactivo por falta de stock.'
        );

    end if;

end trg_producto_sin_stock;
/
create or replace trigger trg_ajustar_inventario_edicion
after update of cantidad, id_producto on DETALLE_PEDIDO
for each row
begin
    if :OLD.id_producto = :NEW.id_producto then
        -- Mismo producto: solo ajustar la diferencia
        update INVENTARIO
           set cantidad = NVL(cantidad, 0)
                         - (NVL(:NEW.cantidad, 0) - NVL(:OLD.cantidad, 0))
         where id_producto = :NEW.id_producto
           and id_estado   = 1;
    else
        -- Cambió el producto: devolver stock al viejo, descontar del nuevo
        update INVENTARIO
           set cantidad = NVL(cantidad, 0) + NVL(:OLD.cantidad, 0)
         where id_producto = :OLD.id_producto
           and id_estado   = 1;

        update INVENTARIO
           set cantidad = NVL(cantidad, 0) - NVL(:NEW.cantidad, 0)
         where id_producto = :NEW.id_producto
           and id_estado   = 1;
    end if;

    dbms_output.put_line(
        'Ajuste de inventario por edición de detalle ' || :NEW.id_detalle_pedido
    );
end trg_ajustar_inventario_edicion;
/
