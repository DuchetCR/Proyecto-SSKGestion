-- Proyecto SC-504 | SSK Gestión
-- 10 Consultas SQL

-- Usuarios activos del sistema
select id_usuario,
       nombre,
       primer_apellido,
       segundo_apellido
from   USUARIO;
where  id_estado = 1;


-- Productos activos con precio mayor a 4000
select id_producto,
       nombre,
       descripcion,
       precio
from   PRODUCTO
where  id_estado = 1
and    precio > 4000;


-- Pedidos que están pendientes o completados
select id_pedido,
       id_usuario,
       fecha_pedido,
       cantidad,
       precio_unitario
from   PEDIDO
where  id_estado in (3, 5);


-- Nombre del cliente y sus pedidos
select u.nombre,
       u.primer_apellido,
       p.id_pedido,
       p.fecha_pedido,
       p.cantidad,
       p.precio_unitario
from   USUARIO u
join   PEDIDO p on p.id_usuario = u.id_usuario
where  u.id_estado = 1;


-- Pedidos con el nombre del producto pedido
select u.nombre            as cliente,
       pr.nombre           as producto,
       p.fecha_pedido,
       p.cantidad,
       p.precio_unitario
from   PEDIDO p
join   USUARIO u          on u.id_usuario  = p.id_usuario
join   DETALLE_PEDIDO dp  on dp.id_pedido  = p.id_pedido
join   PRODUCTO pr        on pr.id_producto = dp.id_producto
where  p.id_estado != 6;


-- Pagos realizados con nombre del método de pago
select pa.id_pago,
       mp.metodo_de_pago,
       pa.monto,
       f.fecha_pago,
       f.total
from   PAGO pa
join   METODO_DE_PAGO mp on mp.id_metodo_de_pago = pa.id_metodo_de_pago
join   DETALLE_FACTURA df on df.id_pago           = pa.id_pago
join   FACTURA f          on f.id_factura          = df.id_factura
where  pa.id_estado = 5;


-- Entregas con nombre del repartidor y fecha
select e.id_entrega,
       u.nombre          as repartidor,
       e.fecha_entrega,
       es.estado         as estado_entrega
from   ENTREGA e
join   USUARIO u  on u.id_usuario = e.id_usuario
join   ESTADO  es on es.id_estado = e.id_estado
where  e.id_estado != 6;


-- Cantidad de pedidos por cliente
select u.nombre,
       u.primer_apellido,
       count(p.id_pedido) as total_pedidos
from   USUARIO u
join   PEDIDO p on p.id_usuario = u.id_usuario
where  p.id_estado != 6
group  by u.nombre, u.primer_apellido
order  by total_pedidos desc;


-- Total facturado y promedio por método de pago
select mp.metodo_de_pago,
       count(pa.id_pago)       as cantidad_pagos,
       sum(pa.monto)           as total_cobrado,
       round(avg(pa.monto), 2) as promedio_pago
from   PAGO pa
join   METODO_DE_PAGO mp on mp.id_metodo_de_pago = pa.id_metodo_de_pago
where  pa.id_estado != 6
group  by mp.metodo_de_pago
order  by sum(pa.monto) desc;


-- Entregas pendientes de realizar
select e.id_entrega,
       e.id_usuario,
       e.fecha_entrega
from   ENTREGA e
where  e.id_estado = 3;