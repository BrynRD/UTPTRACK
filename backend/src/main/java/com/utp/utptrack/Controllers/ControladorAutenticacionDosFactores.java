package com.utp.utptrack.Controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Map;
import java.util.HashMap;
import java.util.Base64;
import com.utp.utptrack.Models.Usuario;
import com.utp.utptrack.Models.Codigo2faRequest;
import com.utp.utptrack.Services.ServicioAutenticacionDosFactores;
import com.utp.utptrack.Services.UsuarioService;
import com.utp.utptrack.Services.JwtService;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/auth/2fa")
public class ControladorAutenticacionDosFactores {

    private final ServicioAutenticacionDosFactores servicioAutenticacionDosFactores;
    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    public ControladorAutenticacionDosFactores(
            ServicioAutenticacionDosFactores servicioAutenticacionDosFactores,
            UsuarioService usuarioService,
            JwtService jwtService) {
        this.servicioAutenticacionDosFactores = servicioAutenticacionDosFactores;
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
    }

    @GetMapping("/estado")
    public ResponseEntity<?> obtenerEstado(@AuthenticationPrincipal UserDetails userDetails) {
        // Verificar si hay un usuario autenticado
        if (userDetails == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("activado", false);
            response.put("mensaje", "Usuario no autenticado");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Usuario usuario = usuarioService.buscarPorUsername(userDetails.getUsername());

        // Verificar si se encontró al usuario
        if (usuario == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("activado", false);
            response.put("mensaje", "Usuario no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("activado", usuario.isActivado2fa());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/configurar")
    public ResponseEntity<?> configurar(@AuthenticationPrincipal UserDetails userDetails) {
        // Verificar si hay un usuario autenticado
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("mensaje", "Usuario no autenticado"));
        }

        Usuario usuario = usuarioService.buscarPorUsername(userDetails.getUsername());

        // Verificar si se encontró al usuario
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", "Usuario no encontrado"));
        }

        if (usuario.isActivado2fa()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "2FA ya está activado"));
        }

        String secreto = servicioAutenticacionDosFactores.generarSecretoNuevo();
        byte[] qrCode = servicioAutenticacionDosFactores.generarImagenQR(secreto, usuario.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("secreto", secreto);
        response.put("qrCode", Base64.getEncoder().encodeToString(qrCode));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/activar")
    public ResponseEntity<?> activar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Codigo2faRequest request) {

        // Verificar si hay un usuario autenticado
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("mensaje", "Usuario no autenticado"));
        }

        Usuario usuario = usuarioService.buscarPorUsername(userDetails.getUsername());

        // Verificar si se encontró al usuario
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", "Usuario no encontrado"));
        }

        if (usuario.isActivado2fa()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "2FA ya está activado"));
        }

        if (servicioAutenticacionDosFactores.verificarCodigo(request.getSecreto(), request.getCodigo())) {
            servicioAutenticacionDosFactores.activar2FA(usuario.getId(), request.getSecreto());
            return ResponseEntity.ok(Map.of("mensaje", "2FA activado exitosamente"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Código inválido"));
        }
    }
    @PostMapping("/desactivar/{idUsuario}")
    public ResponseEntity<?> desactivarParaUsuario(@PathVariable String idUsuario) {
        Usuario usuario = usuarioService.buscarPorId(idUsuario);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", "Usuario no encontrado"));
        }
        if (!usuario.isActivado2fa()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "2FA no está activado"));
        }
        servicioAutenticacionDosFactores.desactivar2FA(usuario.getId());
        return ResponseEntity.ok(Map.of("mensaje", "2FA desactivado exitosamente"));
    }

    @PostMapping("/verificar")
    public ResponseEntity<?> verificar(@RequestBody Codigo2faRequest request) {
        // Usar el método getUsername() en lugar de getCodigoInstitucional()
        Usuario usuario = usuarioService.buscarPorUsername(request.getUsername());

        if (usuario == null) {
            // Intenta con codigoInstitucional como fallback
            usuario = usuarioService.buscarPorUsername(request.getCodigoInstitucional());

            if (usuario == null) {
                return ResponseEntity.badRequest().body(Map.of("mensaje", "Usuario no encontrado"));
            }
        }

        if (!usuario.isActivado2fa()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "2FA no está activado para este usuario"));
        }

        boolean codigoValido = servicioAutenticacionDosFactores.verificarCodigo(usuario.getSecreto2fa(), request.getCodigo());

        if (codigoValido) {
            String token = jwtService.generateToken(usuario);
            return ResponseEntity.ok(Map.of("valido", true, "token", token));
        } else {
            return ResponseEntity.ok(Map.of("valido", false));
        }
    }

    @PostMapping("/desactivar")
    public ResponseEntity<?> desactivar(@AuthenticationPrincipal UserDetails userDetails) {
        // Verificar si hay un usuario autenticado
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("mensaje", "Usuario no autenticado"));
        }

        Usuario usuario = usuarioService.buscarPorUsername(userDetails.getUsername());

        // Verificar si se encontró al usuario
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", "Usuario no encontrado"));
        }

        if (!usuario.isActivado2fa()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "2FA no está activado"));
        }

        servicioAutenticacionDosFactores.desactivar2FA(usuario.getId());
        return ResponseEntity.ok(Map.of("mensaje", "2FA desactivado exitosamente"));
    }}