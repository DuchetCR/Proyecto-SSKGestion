-- Crear el usuario
CREATE USER SSKGestion IDENTIFIED BY --Password;

-- Permiso para conectarse
GRANT CREATE SESSION TO SSKGestion;

-- Permiso para crear sus propias tablas
GRANT CREATE TABLE TO SSKGestion;

-- Espacio en disco para sus tablas
ALTER USER SSKGestion QUOTA UNLIMITED ON USERS;
GRANT CREATE PROCEDURE TO SSKGestion;

SELECT username, account_status
FROM dba_users
WHERE username = 'SSKGESTION';

ALTER USER SSKGESTION ACCOUNT UNLOCK;

SELECT p.profile,
       p.resource_name,
       p.limit
FROM dba_profiles p
JOIN dba_users u
  ON u.profile = p.profile
WHERE u.username = 'SSKGESTION'
  AND p.resource_name IN ('FAILED_LOGIN_ATTEMPTS', 'PASSWORD_LOCK_TIME');