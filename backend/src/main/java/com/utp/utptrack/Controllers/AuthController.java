package com.utp.utptrack.Controllers;

import com.utp.utptrack.Models.Rol;
import com.utp.utptrack.Models.Usuario;
import com.utp.utptrack.Services.RolService;
import com.utp.utptrack.Services.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final RolService rolService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UsuarioService usuarioService, RolService rolService, PasswordEncoder passwordEncoder) {
        this.usuarioService = usuarioService;
        this.rolService = rolService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Map<String, String> datos) {
        try {
            // Verificar que no exista un usuario con el mismo username o email
            if (usuarioService.existePorUsername(datos.get("username"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("mensaje", "El nombre de usuario ya está en uso"));
            }

            if (usuarioService.existePorEmail(datos.get("email"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("mensaje", "El correo electrónico ya está registrado"));
            }

            // Crear el nuevo usuario
            Usuario usuario = new Usuario();
            usuario.setUsername(datos.get("username"));
            usuario.setEmail(datos.get("email"));
            usuario.setPassword(passwordEncoder.encode(datos.get("password")));
            usuario.setEnabled(true);
            usuario.setVerified(false);  // Por defecto no está verificado
            usuario.setActivado2fa(false);  // Por defecto sin 2FA

            // Asignar el rol
            String rolNombre = datos.get("role");
            if (rolNombre == null || rolNombre.isEmpty()) {
                rolNombre = "ROLE_EGRESADO";  // Rol por defecto
            }

            Rol rol = rolService.buscarPorNombre(rolNombre);
            if (rol == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("mensaje", "Rol no encontrado: " + rolNombre));
            }

            Set<Rol> roles = new HashSet<>();
            roles.add(rol);
            usuario.setRoles(roles);

            // Asignar el valor al campo role de la base de datos
            usuario.setDirectRole(rolNombre);

            // Guardar el usuario
            Usuario usuarioGuardado = usuarioService.guardar(usuario);

            // Construir respuesta
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Usuario registrado correctamente");
            respuesta.put("usuario", Map.of(
                    "id", usuarioGuardado.getId(),
                    "username", usuarioGuardado.getUsername(),
                    "email", usuarioGuardado.getEmail(),
                    "role", usuarioGuardado.getMappedRole()
            ));

            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al registrar el usuario: " + e.getMessage()));
        }
    }
}