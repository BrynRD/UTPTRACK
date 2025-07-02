// backend/src/main/java/com/utp/utptrack/Controllers/EgresadoController.java
package com.utp.utptrack.Controllers;

import com.utp.utptrack.Models.Egresado;
import com.utp.utptrack.Models.Usuario;
import com.utp.utptrack.Services.EgresadoService;
import com.utp.utptrack.Services.UsuarioService;
import com.utp.utptrack.dto.EgresadoUsuarioDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/egresados")
public class EgresadoController {

    private final EgresadoService egresadoService;
    private final UsuarioService usuarioService;

    public EgresadoController(EgresadoService egresadoService, UsuarioService usuarioService) {
        this.egresadoService = egresadoService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<EgresadoUsuarioDTO>> obtenerTodos() {
        List<Usuario> usuarios = usuarioService.obtenerTodos();
        List<EgresadoUsuarioDTO> dtos = usuarios.stream()
                .filter(u -> u.getEgresado() != null)
                .map(u -> {
                    Egresado e = u.getEgresado();
                    EgresadoUsuarioDTO dto = new EgresadoUsuarioDTO();
                    dto.setId(e.getId());
                    dto.setUsuarioId(u.getId());
                    dto.setNombre(e.getNombre());
                    dto.setCodigoEstudiante(e.getCodigoEstudiante());
                    dto.setCarrera(e.getCarrera());
                    dto.setAnoGraduacion(e.getAnoGraduacion());
                    dto.setEstadoLaboral(e.getEstadoLaboral());
                    dto.setEmail(u.getEmail());
                    dto.setRole(u.getMappedRole());
                    dto.setHas2FA(u.isActivado2fa());
                    dto.setEnabled(u.isEnabled());
                    dto.setVerified(u.isVerified());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<?> crearEgresado(@RequestBody EgresadoUsuarioDTO dto) {
        try {
            // Obtener el usuario por ID (debe estar creado previamente)
            Usuario usuario = usuarioService.buscarPorId(dto.getUsuarioId());

            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "No se encontró el usuario con ID: " + dto.getUsuarioId()));
            }

            // Crear el objeto Egresado
            Egresado egresado = new Egresado();
            egresado.setNombre(dto.getNombre());
            egresado.setCodigoEstudiante(dto.getCodigoEstudiante());
            egresado.setCarrera(dto.getCarrera());
            egresado.setAnoGraduacion(dto.getAnoGraduacion());
            egresado.setEstadoLaboral(dto.getEstadoLaboral());
            egresado.setUsuario(usuario);

            // Guardar el egresado
            Egresado egresadoGuardado = egresadoService.guardar(egresado);

            // Vincular egresado con usuario
            usuario.setEgresado(egresadoGuardado);
            usuarioService.guardar(usuario);

            // Crear DTO para respuesta
            EgresadoUsuarioDTO respuesta = new EgresadoUsuarioDTO();
            respuesta.setId(egresadoGuardado.getId());
            respuesta.setUsuarioId(usuario.getId());
            respuesta.setNombre(egresadoGuardado.getNombre());
            respuesta.setCodigoEstudiante(egresadoGuardado.getCodigoEstudiante());
            respuesta.setCarrera(egresadoGuardado.getCarrera());
            respuesta.setAnoGraduacion(egresadoGuardado.getAnoGraduacion());
            respuesta.setEstadoLaboral(egresadoGuardado.getEstadoLaboral());
            respuesta.setEmail(usuario.getEmail());
            respuesta.setRole(usuario.getMappedRole());
            respuesta.setHas2FA(usuario.isActivado2fa());
            respuesta.setEnabled(usuario.isEnabled());
            respuesta.setVerified(usuario.isVerified());

            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al crear el egresado: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarEgresado(@PathVariable String id, @RequestBody Egresado datosActualizados) {
        try {
            // Buscar el egresado existente
            Egresado egresadoExistente = egresadoService.buscarPorId(id);
            if (egresadoExistente == null) {
                return ResponseEntity.notFound().build();
            }

            // Guardar la referencia al usuario para mantenerla
            Usuario usuarioExistente = egresadoExistente.getUsuario();

            // Actualizar los campos del egresado con los datos nuevos
            if (datosActualizados.getNombre() != null) egresadoExistente.setNombre(datosActualizados.getNombre());
            if (datosActualizados.getApellido() != null) egresadoExistente.setApellido(datosActualizados.getApellido());
            if (datosActualizados.getCorreo() != null) egresadoExistente.setCorreo(datosActualizados.getCorreo());
            if (datosActualizados.getTelefono() != null) egresadoExistente.setTelefono(datosActualizados.getTelefono());
            if (datosActualizados.getDni() != null) egresadoExistente.setDni(datosActualizados.getDni());
            if (datosActualizados.getSede() != null) egresadoExistente.setSede(datosActualizados.getSede());
            if (datosActualizados.getCarrera() != null) egresadoExistente.setCarrera(datosActualizados.getCarrera());
            if (datosActualizados.getAnoGraduacion() != null) egresadoExistente.setAnoGraduacion(datosActualizados.getAnoGraduacion());
            if (datosActualizados.getCodigoEstudiante() != null) egresadoExistente.setCodigoEstudiante(datosActualizados.getCodigoEstudiante());
            if (datosActualizados.getHabilidadesTecnicas() != null) egresadoExistente.setHabilidadesTecnicas(datosActualizados.getHabilidadesTecnicas());
            if (datosActualizados.getHabilidadesBlandas() != null) egresadoExistente.setHabilidadesBlandas(datosActualizados.getHabilidadesBlandas());
            if (datosActualizados.getEstadoLaboral() != null) egresadoExistente.setEstadoLaboral(datosActualizados.getEstadoLaboral());
            if (datosActualizados.getTiempoPrimerEmpleo() != null) egresadoExistente.setTiempoPrimerEmpleo(datosActualizados.getTiempoPrimerEmpleo());
            if (datosActualizados.getLinkedin() != null) egresadoExistente.setLinkedin(datosActualizados.getLinkedin());
            if (datosActualizados.getSatisfaccionFormacion() != null) egresadoExistente.setSatisfaccionFormacion(datosActualizados.getSatisfaccionFormacion());

            // Restablecer la referencia al usuario para mantener la relación
            egresadoExistente.setUsuario(usuarioExistente);

            // Guardar el egresado actualizado
            Egresado actualizado = egresadoService.guardar(egresadoExistente);

            // Crear un DTO para la respuesta evitando la recursión
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("id", actualizado.getId());
            respuesta.put("nombre", actualizado.getNombre());
            respuesta.put("apellido", actualizado.getApellido());
            respuesta.put("correo", actualizado.getCorreo());
            respuesta.put("telefono", actualizado.getTelefono());
            respuesta.put("dni", actualizado.getDni());
            respuesta.put("sede", actualizado.getSede());
            respuesta.put("carrera", actualizado.getCarrera());
            respuesta.put("anoGraduacion", actualizado.getAnoGraduacion());
            respuesta.put("codigoEstudiante", actualizado.getCodigoEstudiante());
            respuesta.put("habilidadesTecnicas", actualizado.getHabilidadesTecnicas());
            respuesta.put("habilidadesBlandas", actualizado.getHabilidadesBlandas());
            respuesta.put("estadoLaboral", actualizado.getEstadoLaboral());
            respuesta.put("tiempoPrimerEmpleo", actualizado.getTiempoPrimerEmpleo());
            respuesta.put("linkedin", actualizado.getLinkedin());
            respuesta.put("satisfaccionFormacion", actualizado.getSatisfaccionFormacion());

            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al actualizar el egresado: " + e.getMessage()));
        }
    }

    // Nuevo método para eliminar egresado
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarEgresado(@PathVariable String id) {
        try {
            Egresado egresado = egresadoService.buscarPorId(id);
            if (egresado == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "Egresado no encontrado"));
            }

            egresadoService.eliminar(id);

            return ResponseEntity.ok(Map.of("mensaje", "Egresado eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al eliminar el egresado: " + e.getMessage()));
        }
    }
}