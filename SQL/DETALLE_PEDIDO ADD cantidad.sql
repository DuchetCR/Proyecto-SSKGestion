ALTER TABLE DETALLE_PEDIDO ADD cantidad NUMBER;

UPDATE DETALLE_PEDIDO SET cantidad = 10 WHERE id_detalle_pedido = 1;
UPDATE DETALLE_PEDIDO SET cantidad = 5  WHERE id_detalle_pedido = 2;
UPDATE DETALLE_PEDIDO SET cantidad = 3  WHERE id_detalle_pedido = 3;
UPDATE DETALLE_PEDIDO SET cantidad = 8  WHERE id_detalle_pedido = 4;
UPDATE DETALLE_PEDIDO SET cantidad = 20 WHERE id_detalle_pedido = 5;
UPDATE DETALLE_PEDIDO SET cantidad = 15 WHERE id_detalle_pedido = 6;
UPDATE DETALLE_PEDIDO SET cantidad = 6  WHERE id_detalle_pedido = 7;
UPDATE DETALLE_PEDIDO SET cantidad = 2  WHERE id_detalle_pedido = 8;
UPDATE DETALLE_PEDIDO SET cantidad = 12 WHERE id_detalle_pedido = 9;
UPDATE DETALLE_PEDIDO SET cantidad = 4  WHERE id_detalle_pedido = 10;
UPDATE DETALLE_PEDIDO SET cantidad = 5  WHERE id_detalle_pedido = 11;
UPDATE DETALLE_PEDIDO SET cantidad = 10 WHERE id_detalle_pedido = 12;
UPDATE DETALLE_PEDIDO SET cantidad = 8  WHERE id_detalle_pedido = 13;
UPDATE DETALLE_PEDIDO SET cantidad = 6  WHERE id_detalle_pedido = 14;
UPDATE DETALLE_PEDIDO SET cantidad = 3  WHERE id_detalle_pedido = 15;
COMMIT;