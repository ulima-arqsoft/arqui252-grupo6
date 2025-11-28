-- 1. Crear la tabla
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL
);

INSERT INTO usuarios (nombre_completo, email) VALUES ('Juan Perez', 'juan@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Maria Gomez', 'maria@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Gian Marco', 'gianmarco@musica.pe');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Carlos Lopez', 'carlos@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Ana Torres', 'ana@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Luis Diaz', 'luis@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Elena Ruiz', 'elena@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Pedro Sanchez', 'pedro@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Sofia Castro', 'sofia@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Miguel Angel', 'miguel@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Laura Ramos', 'laura@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('David Lima', 'david@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Carmen Solis', 'carmen@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Roberto Vega', 'roberto@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Isabel Cruz', 'isabel@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Fernando Silva', 'fernando@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Patricia Flores', 'patricia@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Ricardo Morales', 'ricardo@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Gabriela Ortiz', 'gabriela@test.com');
INSERT INTO usuarios (nombre_completo, email) VALUES ('Hugo Gutierrez', 'hugo@test.com');
