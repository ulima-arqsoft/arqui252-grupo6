
ALTER TABLE usuarios ADD COLUMN nombre VARCHAR(50);
ALTER TABLE usuarios ADD COLUMN apellido VARCHAR(50);

UPDATE usuarios 
SET 
    nombre = SPLIT_PART(nombre_completo, ' ', 1),
    apellido = SPLIT_PART(nombre_completo, ' ', 2);

ALTER TABLE usuarios ALTER COLUMN nombre SET NOT NULL;

ALTER TABLE usuarios DROP COLUMN nombre_completo;
