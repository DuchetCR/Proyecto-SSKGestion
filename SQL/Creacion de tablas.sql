-- Proyecto SC-504 | Creación de tablas

-- Tablas de catálogo

CREATE TABLE ESTADO (
    id_estado   NUMBER PRIMARY KEY,
    estado      VARCHAR2(50) NOT NULL
);

CREATE TABLE TIPO_USUARIO (
    id_tipo_usuario NUMBER PRIMARY KEY,
    id_estado       NUMBER,
    nombre          VARCHAR2(100) NOT NULL,
    CONSTRAINT fk_tipousr_estado
        FOREIGN KEY (id_estado) REFERENCES ESTADO(id_estado)
);

CREATE TABLE PUESTO (
    id_puesto    NUMBER PRIMARY KEY,
    id_estado    NUMBER,
    nombre_puesto VARCHAR2(100) NOT NULL,
    CONSTRAINT fk_puesto_estado
        FOREIGN KEY (id_estado) REFERENCES ESTADO(id_estado)
);

CREATE TABLE METODO_DE_PAGO (
    id_metodo_de_pago NUMBER PRIMARY KEY,
    id_estado         NUMBER,
    metodo_de_pago    VARCHAR2(100) NOT NULL,
    CONSTRAINT fk_metodopago_estado
        FOREIGN KEY (id_estado) REFERENCES ESTADO(id_estado)
);

-- Tablas geográficas

CREATE TABLE PROVINCIA (
    id_Provincia    NUMBER PRIMARY KEY,
    id_estado       NUMBER,
    nombre_provincia VARCHAR2(100) NOT NULL,
    CONSTRAINT fk_provincia_estado
        FOREIGN KEY (id_estado) REFERENCES ESTADO(id_estado)
);

CREATE TABLE CANTON (
    id_Canton       NUMBER PRIMARY KEY,
    id_estado       NUMBER,
    id_Provincia    NUMBER,
    nombre_canton   VARCHAR2(100) NOT NULL,
    CONSTRAINT fk_canton_estado
        FOREIGN KEY (id_estado)    REFERENCES ESTADO(id_estado),
    CONSTRAINT fk_canton_provincia
        FOREIGN KEY (id_Provincia) REFERENCES PROVINCIA(id_Provincia)
);

CREATE TABLE DISTRITO (
    id_Distrito     NUMBER PRIMARY KEY,
    id_estado       NUMBER,
    id_Canton       NUMBER,
    nombre_distrito VARCHAR2(100) NOT NULL,
    CONSTRAINT fk_distrito_estado
        FOREIGN KEY (id_estado)  REFERENCES ESTADO(id_estado),
    CONSTRAINT fk_distrito_canton
        FOREIGN KEY (id_Canton)  REFERENCES CANTON(id_Canton)
);

-- Tabla principal USUARIO

CREATE TABLE USUARIO (
    id_usuario       NUMBER PRIMARY KEY,
    id_tipo_usuario  NUMBER,
    id_estado        NUMBER,
    id_puesto        NUMBER,
    nombre           VARCHAR2(100) NOT NULL,
    primer_apellido  VARCHAR2(100),
    segundo_apellido VARCHAR2(100),
    salario          NUMBER(10,2),
    CONSTRAINT fk_usuario_tipousr
        FOREIGN KEY (id_tipo_usuario) REFERENCES TIPO_USUARIO(id_tipo_usuario),
    CONSTRAINT fk_usuario_estado
        FOREIGN KEY (id_estado)       REFERENCES ESTADO(id_estado),
    CONSTRAINT fk_usuario_puesto
        FOREIGN KEY (id_puesto)       REFERENCES PUESTO(id_puesto)
);

-- Tablas de contacto

CREATE TABLE CORREO (
    id_usuario  NUMBER PRIMARY KEY,
    id_estado   NUMBER,
    correo      VARCHAR2(200) NOT NULL,
    CONSTRAINT fk_correo_usuario
        FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
    CONSTRAINT fk_correo_estado
        FOREIGN KEY (id_estado)  REFERENCES ESTADO(id_estado)
);

CREATE TABLE TELEFONO (
    id_usuario  NUMBER PRIMARY KEY,
    id_estado   NUMBER,
    telefono    VARCHAR2(20) NOT NULL,
    CONSTRAINT fk_telefono_usuario
        FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
    CONSTRAINT fk_telefono_estado
        FOREIGN KEY (id_estado)  REFERENCES ESTADO(id_estado)
);

CREATE TABLE DIRECCION (
    id_usuario  NUMBER PRIMARY KEY,
    id_estado   NUMBER,
    id_Distrito NUMBER,
    otras_senas VARCHAR2(255),
    CONSTRAINT fk_dir_usuario
        FOREIGN KEY (id_usuario)  REFERENCES USUARIO(id_usuario),
    CONSTRAINT fk_dir_estado
        FOREIGN KEY (id_estado)   REFERENCES ESTADO(id_estado),
    CONSTRAINT fk_dir_distrito
        FOREIGN KEY (id_Distrito) REFERENCES DISTRITO(id_Distrito)
);

-- Producto e inventario

CREATE TABLE PRODUCTO (
    id_producto NUMBER PRIMARY KEY,
    id_usuario  NUMBER,
    id_estado   NUMBER,
    nombre      VARCHAR2(100) NOT NULL,
    descripcion VARCHAR2(255),
    precio      NUMBER(10,2),
    CONSTRAINT fk_producto_usuario
        FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
    CONSTRAINT fk_producto_estado
        FOREIGN KEY (id_estado)  REFERENCES ESTADO(id_estado)
);

CREATE TABLE INVENTARIO (
    id_inventario NUMBER PRIMARY KEY,
    id_producto   NUMBER,
    id_estado     NUMBER,
    cantidad      NUMBER,
    CONSTRAINT fk_inventario_producto
        FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto),
    CONSTRAINT fk_inventario_estado
        FOREIGN KEY (id_estado)   REFERENCES ESTADO(id_estado)
);

-- Pedido y detalle

CREATE TABLE PEDIDO (
    id_pedido       NUMBER PRIMARY KEY,
    id_usuario      NUMBER,
    id_estado       NUMBER,
    fecha_pedido    DATE,
    cantidad        NUMBER,
    precio_unitario NUMBER(10,2),
    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
    CONSTRAINT fk_pedido_estado
        FOREIGN KEY (id_estado)  REFERENCES ESTADO(id_estado)
);

CREATE TABLE DETALLE_PEDIDO (
    id_detalle_pedido NUMBER PRIMARY KEY,
    id_pedido         NUMBER,
    id_producto       NUMBER,
    id_estado         NUMBER,
    CONSTRAINT fk_detped_pedido
        FOREIGN KEY (id_pedido)   REFERENCES PEDIDO(id_pedido),
    CONSTRAINT fk_detped_producto
        FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto),
    CONSTRAINT fk_detped_estado
        FOREIGN KEY (id_estado)   REFERENCES ESTADO(id_estado)
);

-- Pago y facturación

CREATE TABLE PAGO (
    id_pago           NUMBER PRIMARY KEY,
    id_metodo_de_pago NUMBER,
    id_estado         NUMBER,
    monto             NUMBER(10,2),
    CONSTRAINT fk_pago_metodo
        FOREIGN KEY (id_metodo_de_pago) REFERENCES METODO_DE_PAGO(id_metodo_de_pago),
    CONSTRAINT fk_pago_estado
        FOREIGN KEY (id_estado)         REFERENCES ESTADO(id_estado)
);

CREATE TABLE FACTURA (
    id_factura          NUMBER PRIMARY KEY,
    id_detalle_factura  NUMBER,
    id_estado           NUMBER,
    fecha_pago          DATE,
    total               NUMBER(10,2),
    CONSTRAINT fk_factura_estado
        FOREIGN KEY (id_estado) REFERENCES ESTADO(id_estado)
);

CREATE TABLE DETALLE_FACTURA (
    id_detalle_factura NUMBER PRIMARY KEY,
    id_estado          NUMBER,
    id_pago            NUMBER,
    id_pedido          NUMBER,
    id_factura         NUMBER,
    id_usuario         NUMBER,
    CONSTRAINT fk_detfac_estado
        FOREIGN KEY (id_estado)  REFERENCES ESTADO(id_estado),
    CONSTRAINT fk_detfac_pago
        FOREIGN KEY (id_pago)    REFERENCES PAGO(id_pago),
    CONSTRAINT fk_detfac_pedido
        FOREIGN KEY (id_pedido)  REFERENCES PEDIDO(id_pedido),
    CONSTRAINT fk_detfac_factura
        FOREIGN KEY (id_factura) REFERENCES FACTURA(id_factura),
    CONSTRAINT fk_detfac_usuario
        FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);

-- Entrega

CREATE TABLE ENTREGA (
    id_entrega        NUMBER PRIMARY KEY,
    id_direccion      NUMBER,
    id_usuario        NUMBER,
    id_detalle_pedido NUMBER,
    id_estado         NUMBER,
    fecha_entrega     DATE,
    CONSTRAINT fk_entrega_direccion
        FOREIGN KEY (id_direccion)      REFERENCES DIRECCION(id_usuario),
    CONSTRAINT fk_entrega_usuario
        FOREIGN KEY (id_usuario)        REFERENCES USUARIO(id_usuario),
    CONSTRAINT fk_entrega_detpedido
        FOREIGN KEY (id_detalle_pedido) REFERENCES DETALLE_PEDIDO(id_detalle_pedido),
    CONSTRAINT fk_entrega_estado
        FOREIGN KEY (id_estado)         REFERENCES ESTADO(id_estado)
);