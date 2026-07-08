-- Crear el usuario
CREATE USER SSKGestion IDENTIFIED BY --Password;

-- Permiso para conectarse
GRANT CREATE SESSION TO SSKGestion;

-- Permiso para crear sus propias tablas
GRANT CREATE TABLE TO SSKGestion;

-- Espacio en disco para sus tablas
ALTER USER SSKGestion QUOTA UNLIMITED ON USERS;
GRANT CREATE PROCEDURE TO SSKGestion;
