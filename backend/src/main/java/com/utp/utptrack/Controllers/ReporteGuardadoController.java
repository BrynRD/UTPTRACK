package com.utp.utptrack.Controllers;

import com.utp.utptrack.Models.ReporteGuardado;
import com.utp.utptrack.Services.ReporteGuardadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.io.IOException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reportes/guardados")
public class ReporteGuardadoController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReporteGuardadoController.class);
    
    @Autowired
    private ReporteGuardadoService reporteGuardadoService;

    // Endpoint de prueba
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("Endpoint de prueba llamado");
        return ResponseEntity.ok("ReporteGuardadoController funcionando correctamente");
    }

    // Guardar un reporte generado
    @PostMapping("/guardar")
    public ResponseEntity<ReporteGuardado> guardarReporte(@RequestBody ReporteGuardadoDTO dto) {
        logger.info("Guardando reporte para usuario: {}", dto.usuarioId);
        ReporteGuardado reporte = reporteGuardadoService.guardarReporte(
                dto.usuarioId, dto.tipoReporte, dto.parametros, dto.urlArchivo, dto.estado
        );
        logger.info("Reporte guardado exitosamente con ID: {}", reporte.getId());
        return ResponseEntity.ok(reporte);
    }

    // Listar reportes por usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<ReporteGuardado>> listarPorUsuario(@PathVariable String usuarioId) {
        logger.info("Listando reportes para usuario: {}", usuarioId);
        List<ReporteGuardado> reportes = reporteGuardadoService.listarPorUsuario(usuarioId);
        logger.info("Encontrados {} reportes para usuario: {}", reportes.size(), usuarioId);
        return ResponseEntity.ok(reportes);
    }

    // Eliminar un reporte guardado
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarReporte(@PathVariable String id) {
        logger.info("Eliminando reporte con ID: {}", id);
        boolean eliminado = reporteGuardadoService.eliminarReporte(id);
        if (eliminado) {
            logger.info("Reporte eliminado exitosamente");
            return ResponseEntity.ok().build();
        } else {
            logger.warn("Reporte no encontrado para eliminar");
            return ResponseEntity.notFound().build();
        }
    }

    // Descargar archivo generado (forzar descarga con Content-Disposition)
    @CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.HEAD})
    @GetMapping("/descargar-archivo/{filename:.+}")
    public ResponseEntity<Resource> descargarArchivoForzado(@PathVariable String filename) throws IOException {
        // Usar ruta relativa a la raíz de ejecución para evitar doble 'backend/backend'
        Path file = Paths.get(System.getProperty("user.dir"), "exports", filename);
        if (!Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(file.toUri());
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .body(resource);
    }

    // DTO para recibir datos del frontend
    public static class ReporteGuardadoDTO {
        public String usuarioId;
        public String tipoReporte;
        public String parametros;
        public String urlArchivo;
        public String estado; // "reciente" o "programado"
    }
} 