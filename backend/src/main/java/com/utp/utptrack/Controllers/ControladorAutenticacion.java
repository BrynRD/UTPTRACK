package com.utp.utptrack.Controllers;

import com.utp.utptrack.Models.LoginRequest;
import com.utp.utptrack.Models.Usuario;
import com.utp.utptrack.Models.Egresado;
import com.utp.utptrack.Services.JwtService;
import com.utp.utptrack.Services.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ControladorAutenticacion {

    private static final Logger logger = LoggerFactory.getLogger(ControladorAutenticacion.class);

    private final UsuarioService usuarioService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public ControladorAutenticacion(
            UsuarioService usuarioService,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        logger.info("Intento de login para usuario: {}", request.getUsername());

        Usuario usuario = usuarioService.buscarPorUsername(request.getUsername());

        if (usuario == null) {
            logger.warn("Usuario no encontrado: {}", request.getUsername());
            return ResponseEntity.status(401).body(Map.of("mensaje", "Usuario no encontrado"));
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            logger.warn("Contraseña incorrecta para usuario: {}", request.getUsername());
            return ResponseEntity.status(401).body(Map.of("mensaje", "Contraseña incorrecta"));
        }

        Map<String, Object> response = new HashMap<>();

        if (usuario.isActivado2fa()) {
            logger.info("Usuario requiere 2FA: {}", request.getUsername());
            response.put("requiere2FA", true);
            response.put("mensaje", "Se requiere verificación de dos factores");
            return ResponseEntity.ok(response);
        } else {
            // Garantizar que el rol nunca sea nulo
            String role = usuario.getRole();
            if (role == null || role.isEmpty()) {
                role = "USER";
                logger.warn("Usuario {} sin rol asignado, usando rol predeterminado: {}",
                        request.getUsername(), role);
            }

            String token = jwtService.generateToken(usuario);

            logger.info("Login exitoso para usuario: {}, rol: {}", request.getUsername(), role);

            response.put("token", token);
            response.put("requiere2FA", false);
            response.put("role", role);
            response.put("id", usuario.getId());
            response.put("email", usuario.getEmail());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/verificar")
    public ResponseEntity<?> verificarAutenticacion(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            String username = userDetails.getUsername();
            logger.info("Verificando autenticación para: {}", username);

            Usuario usuario = usuarioService.buscarPorUsername(username);

            // Garantizar que el rol nunca sea nulo
            String role = usuario.getRole();
            if (role == null || role.isEmpty()) {
                role = "USER";
                logger.warn("Usuario {} sin rol asignado, usando rol predeterminado: {}",
                        username, role);
            }

            logger.info("Usuario autenticado: {}, rol: {}", username, role);

            Map<String, Object> response = new HashMap<>();
            response.put("autenticado", true);
            response.put("id", usuario.getId());
            response.put("username", username);
            response.put("email", usuario.getEmail());
            response.put("role", role);

            if (usuario.getEgresado() != null) {
                response.put("egresado", mapEgresado(usuario.getEgresado()));
            }

            return ResponseEntity.ok(response);
        }

        logger.warn("Intento de verificación sin usuario autenticado");
        return ResponseEntity.status(401).body(Map.of("autenticado", false));
    }

    @GetMapping("/verificar-token")
    public ResponseEntity<?> verificarToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("Token no proporcionado o formato incorrecto");
                return ResponseEntity.status(401).body(Map.of(
                        "authenticated", false,
                        "error", "Token no proporcionado"
                ));
            }

            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
            String tokenRole = jwtService.extractRole(token);

            logger.info("Verificando token para usuario: {}, rol del token: {}", username, tokenRole);

            if (username != null && jwtService.isTokenValid(token)) {
                Usuario usuario = usuarioService.buscarPorUsername(username);
                if (usuario == null) {
                    logger.warn("Usuario del token no encontrado en la base de datos: {}", username);
                    return ResponseEntity.status(401).body(Map.of(
                            "authenticated", false,
                            "error", "Usuario no encontrado"
                    ));
                }

                // Obtener el rol del usuario de la base de datos (ahora sabemos que existe)
                String userRole = usuario.getRole();

                // Si hay discrepancia entre el rol del token y el de la base de datos, registrarlo
                if (tokenRole != null && userRole != null && !tokenRole.equals(userRole)) {
                    logger.warn("Discrepancia de roles para {}: token={}, usuario={}", username, tokenRole, userRole);
                    // Decidir qué rol tiene prioridad (en este caso, el de la base de datos)
                    tokenRole = userRole;
                }

                Map<String, Object> response = new HashMap<>();
                response.put("authenticated", true);
                response.put("id", usuario.getId());
                response.put("username", username);
                response.put("email", usuario.getEmail());
                response.put("role", userRole);  // Usar el rol de la base de datos por consistencia

                if (usuario.getEgresado() != null) {
                    response.put("egresado", mapEgresado(usuario.getEgresado()));
                }

                logger.info("Token válido para: {}, rol: {}", username, userRole);
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Token inválido o expirado");
                return ResponseEntity.status(401).body(Map.of(
                        "authenticated", false,
                        "error", "Token inválido o expirado"
                ));
            }
        } catch (Exception e) {
            logger.error("Error al validar token: {}", e.getMessage(), e);
            return ResponseEntity.status(401).body(Map.of(
                    "authenticated", false,
                    "error", "Error al validar token",
                    "message", e.getMessage()
            ));
        }
    }

    // Método auxiliar para mapear todos los campos del egresado
    private Map<String, Object> mapEgresado(Egresado e) {
        Map<String, Object> egresadoData = new HashMap<>();
        egresadoData.put("id", e.getId());
        egresadoData.put("nombre", e.getNombre());
        egresadoData.put("codigoEstudiante", e.getCodigoEstudiante());
        egresadoData.put("edad", e.getEdad());
        egresadoData.put("genero", e.getGenero());
        egresadoData.put("carrera", e.getCarrera());
        egresadoData.put("sede", e.getSede());
        egresadoData.put("anoGraduacion", e.getAnoGraduacion());
        egresadoData.put("estadoLaboral", e.getEstadoLaboral());
        egresadoData.put("habilidadesTecnicas", e.getHabilidadesTecnicas());
        egresadoData.put("habilidadesBlandas", e.getHabilidadesBlandas());
        egresadoData.put("telefono", e.getTelefono());
        egresadoData.put("dni", e.getDni());
        egresadoData.put("linkedin", e.getLinkedin());
        egresadoData.put("tiene2fa", e.getTiene2fa());
        egresadoData.put("satisfaccionFormacion", e.getSatisfaccionFormacion());
        egresadoData.put("tiempoPrimerEmpleo", e.getTiempoPrimerEmpleo());
        egresadoData.put("createdAt", e.getCreatedAt());
        egresadoData.put("updatedAt", e.getUpdatedAt());
        return egresadoData;
    }
}