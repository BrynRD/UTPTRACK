package com.utp.utptrack.Controllers;

import com.utp.utptrack.Models.ExperienciaLaboral;
import com.utp.utptrack.Models.Egresado;
import com.utp.utptrack.Services.ExperienciaLaboralService;
import com.utp.utptrack.Services.EgresadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/experiencias-laborales")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ExperienciaLaboralController {

    @Autowired
    private ExperienciaLaboralService experienciaLaboralService;

    @Autowired
    private EgresadoService egresadoService;

    @GetMapping("/egresado/{egresadoId}")
    public ResponseEntity<List<ExperienciaLaboral>> getExperienciasByEgresadoId(@PathVariable String egresadoId) {
        try {
            List<ExperienciaLaboral> experiencias = experienciaLaboralService.findByEgresadoId(egresadoId);
            return ResponseEntity.ok(experiencias);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createExperienciaLaboral(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== CREAR EXPERIENCIA LABORAL ===");
            System.out.println("Request recibido: " + request);
            
            String egresadoId = (String) request.get("idEgresado");
            System.out.println("Egresado ID: " + egresadoId);
            
            Egresado egresado = egresadoService.buscarPorId(egresadoId);
            
            if (egresado == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "Egresado no encontrado"));
            }

            ExperienciaLaboral experienciaLaboral = new ExperienciaLaboral();
            experienciaLaboral.setEmpresa((String) request.get("empresa"));
            experienciaLaboral.setPuesto((String) request.get("puesto"));
            experienciaLaboral.setFechaInicio(java.sql.Date.valueOf((String) request.get("fechaInicio")));
            
            if (request.get("fechaFin") != null && !((String) request.get("fechaFin")).isEmpty()) {
                experienciaLaboral.setFechaFin(java.sql.Date.valueOf((String) request.get("fechaFin")));
            }
            
            if (request.get("salario") != null) {
                experienciaLaboral.setSalario((Integer) request.get("salario"));
            }
            
            experienciaLaboral.setDescripcion((String) request.get("descripcion"));
            experienciaLaboral.setEgresado(egresado);

            ExperienciaLaboral saved = experienciaLaboralService.save(experienciaLaboral);
            System.out.println("Experiencia laboral creada exitosamente: " + saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            System.err.println("Error al crear experiencia laboral: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al crear experiencia laboral: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExperienciaLaboral(@PathVariable String id, @RequestBody Map<String, Object> request) {
        try {
            Optional<ExperienciaLaboral> existingOpt = experienciaLaboralService.findById(id);
            if (!existingOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "Experiencia laboral no encontrada"));
            }

            ExperienciaLaboral existing = existingOpt.get();
            
            if (request.get("empresa") != null) {
                existing.setEmpresa((String) request.get("empresa"));
            }
            if (request.get("puesto") != null) {
                existing.setPuesto((String) request.get("puesto"));
            }
            if (request.get("fechaInicio") != null) {
                existing.setFechaInicio(java.sql.Date.valueOf((String) request.get("fechaInicio")));
            }
            if (request.get("fechaFin") != null) {
                existing.setFechaFin(java.sql.Date.valueOf((String) request.get("fechaFin")));
            } else {
                existing.setFechaFin(null);
            }
            if (request.get("salario") != null) {
                existing.setSalario((Integer) request.get("salario"));
            } else {
                existing.setSalario(null);
            }
            if (request.get("descripcion") != null) {
                existing.setDescripcion((String) request.get("descripcion"));
            }

            ExperienciaLaboral updated = experienciaLaboralService.save(existing);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al actualizar experiencia laboral: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExperienciaLaboral(@PathVariable String id) {
        try {
            experienciaLaboralService.delete(id);
            return ResponseEntity.ok(Map.of("mensaje", "Experiencia laboral eliminada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al eliminar experiencia laboral: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExperienciaLaboralById(@PathVariable String id) {
        try {
            Optional<ExperienciaLaboral> experiencia = experienciaLaboralService.findById(id);
            if (experiencia.isPresent()) {
                return ResponseEntity.ok(experiencia.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "Experiencia laboral no encontrada"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al obtener experiencia laboral: " + e.getMessage()));
        }
    }

    @GetMapping("/egresado/{egresadoId}/actuales")
    public ResponseEntity<List<ExperienciaLaboral>> getCurrentExperienciasByEgresadoId(@PathVariable String egresadoId) {
        try {
            List<ExperienciaLaboral> experiencias = experienciaLaboralService.findCurrentExperiencesByEgresadoId(egresadoId);
            return ResponseEntity.ok(experiencias);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/egresado/{egresadoId}/anteriores")
    public ResponseEntity<List<ExperienciaLaboral>> getPastExperienciasByEgresadoId(@PathVariable String egresadoId) {
        try {
            List<ExperienciaLaboral> experiencias = experienciaLaboralService.findPastExperiencesByEgresadoId(egresadoId);
            return ResponseEntity.ok(experiencias);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 