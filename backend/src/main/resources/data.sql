-- Insertar roles
INSERT INTO roles (nombre) VALUES ('ADMIN');
INSERT INTO roles (nombre) VALUES ('USER');

-- Insertar usuario administrador
-- Contraseña: admin123 (encriptada con BCrypt)
INSERT INTO usuarios (id, username, email, password, role, enabled, verified, activado2fa, created_at, updated_at) 
VALUES ('admin-001', 'admin', 'admin@utp.edu.pe', '$2a$10$N.zmdr9k7uOCQb97.AnUPu5F6N2rO5R7H5E5L9B6Y6NCz8RWQ1VQK', 'ADMIN', true, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertar usuario de prueba
-- Contraseña: user123 (encriptada con BCrypt)
INSERT INTO usuarios (id, username, email, password, role, enabled, verified, activado2fa, created_at, updated_at) 
VALUES ('user-001', 'user', 'user@utp.edu.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'USER', true, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertar egresado de ejemplo
INSERT INTO egresados (id, codigo_estudiante, nombre, apellido, dni, correo, telefono, carrera, sede, ano_graduacion, edad, genero, estado_laboral, empresa, habilidades_tecnicas, habilidades_blandas, satisfaccion_formacion, tiempo_primer_empleo, linkedin, tiene2fa, created_at, updated_at)
VALUES ('egr-001', 'U18201234', 'Juan Carlos', 'Pérez Rodríguez', '12345678', 'juan.perez@email.com', '987654321', 'Ingeniería de Sistemas', 'Lima', 2023, 25, 'Masculino', 'Empleado', 'Tech Solutions SAC', 'Java,Spring Boot,Angular,MySQL', 'Trabajo en equipo,Liderazgo,Comunicación', 4, 3, 'https://linkedin.com/in/jcperez', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertar experiencia laboral de ejemplo
INSERT INTO experiencias_laborales (id, id_egresado, empresa, puesto, descripcion, fecha_inicio, fecha_fin, salario)
VALUES ('exp-001', 'egr-001', 'Tech Solutions SAC', 'Desarrollador Full Stack', 'Desarrollo de aplicaciones web con Java Spring Boot y Angular', '2023-06-01', NULL, 3500);

-- Relacionar usuario con egresado
UPDATE usuarios SET id_egresado = 'egr-001' WHERE username = 'user';

-- Insertar relaciones usuario-rol
INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ('admin-001', 1);
INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ('user-001', 2);
