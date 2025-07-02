// backend/src/main/java/com/utp/utptrack/Controllers/UsuarioController.java
package com.utp.utptrack.Controllers;

import com.utp.utptrack.Models.Usuario;
import com.utp.utptrack.Models.Rol;
import com.utp.utptrack.Services.UsuarioService;
import com.utp.utptrack.Services.RolService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final RolService rolService;

    public UsuarioController(UsuarioService usuarioService, RolService rolService) {
        this.usuarioService = usuarioService;
        this.rolService = rolService;
    }

    @PostMapping("/{id}/cambiar-rol")
    public ResponseEntity<?> cambiarRol(@PathVariable String id, @RequestBody Map<String, String> body) {
        String nuevoRol = body.get("role");
        Usuario usuario = usuarioService.buscarPorId(id);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", "Usuario no encontrado"));
        }

        // Mapear el rol recibido del frontend al formato de la base de datos
        String dbRole;
        if ("ADMIN".equals(nuevoRol)) {
            dbRole = "ROLE_ADMIN";
        } else if ("GRADUATE".equals(nuevoRol)) {
            dbRole = "ROLE_EGRESADO";
        } else {
            dbRole = "ROLE_" + nuevoRol;
        }

        // Buscar el rol existente en lugar de crear uno nuevo
        Rol rol = rolService.buscarPorNombre(dbRole);
        if (rol == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("mensaje", "Rol no encontrado: " + dbRole));
        }

        Set<Rol> roles = new HashSet<>();
        roles.add(rol);
        usuario.setRoles(roles);
        usuarioService.guardar(usuario);

        return ResponseEntity.ok(Map.of(
                "mensaje", "Rol actualizado",
                "role", usuario.getMappedRole()
        ));
    }

    // Nuevo método para eliminar un usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable String id) {
        try {
            Usuario usuario = usuarioService.buscarPorId(id);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "Usuario no encontrado"));
            }

            usuarioService.eliminar(id);

            return ResponseEntity.ok(Map.of("mensaje", "Usuario eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al eliminar el usuario: " + e.getMessage()));
        }
    }
}