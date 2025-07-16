package com.utp.utptrack.Controllers;

import com.utp.utptrack.dto.EgresadoDTO;
import com.utp.utptrack.Repositories.EgresadoRepository;
import com.utp.utptrack.Services.EgresadoService;
import com.utp.utptrack.Services.ReporteService;
import com.utp.utptrack.Services.ReporteGuardadoService;
import com.utp.utptrack.Services.UsuarioService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.utp.utptrack.Models.Egresado;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ReporteController {

    private final EgresadoService egresadoService;
    private final ReporteService reporteService;
    private final EgresadoRepository egresadoRepository;
    private final ReporteGuardadoService reporteGuardadoService;
    private final UsuarioService usuarioService;

    @Autowired
    public ReporteController(EgresadoService egresadoService, ReporteService reporteService, EgresadoRepository egresadoRepository, ReporteGuardadoService reporteGuardadoService, UsuarioService usuarioService) {
        this.egresadoService = egresadoService;
        this.reporteService = reporteService;
        this.egresadoRepository = egresadoRepository;
        this.reporteGuardadoService = reporteGuardadoService;
        this.usuarioService = usuarioService;
    }

    @GetMapping("/egresados")
    public ResponseEntity<Page<EgresadoDTO>> getEgresadosPaginados(
            @RequestParam(required = false) String carrera,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String sede,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        try {
            Page<EgresadoDTO> egresados = egresadoService.findEgresadosFiltered(
                    carrera, fechaInicio, fechaFin, estado, sede, page, size);

            return ResponseEntity.ok(egresados);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/egresados/export")
    public void exportEgresados(
            HttpServletResponse response,
            @RequestParam(required = false) String carrera,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String sede,
            @RequestParam(defaultValue = "excel") String formato) throws IOException {

        response.setContentType(formato.equals("excel") ?
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
                "application/pdf");

        String filename = "egresados_" + LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String headerValue = "attachment; filename=" + filename + (formato.equals("excel") ? ".xlsx" : ".pdf");
        response.setHeader("Content-Disposition", headerValue);

        reporteService.exportarEgresados(response, carrera, fechaInicio, fechaFin, estado, sede, formato);
    }

    // Nuevo endpoint para exportación de reportes
    @PostMapping("/exportar-y-guardar")
    public ResponseEntity<?> exportarYGuardarReporte(
            @RequestParam String type,
            @RequestParam(required = false) String carrera,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String sede,
            @RequestParam(defaultValue = "excel") String formato,
            @RequestParam String usuarioId
    ) {
        try {
            Integer yearInicio = fechaInicio != null ? fechaInicio.getYear() : null;
            Integer yearFin = fechaFin != null ? fechaFin.getYear() : null;

            byte[] reportBytes;
            String filename;
            String extension = formato.equalsIgnoreCase("excel") ? ".xlsx" : ".pdf";
            String carpetaExport = "exports";
            String nombreArchivo;
            String urlArchivo;

            switch (type) {
                case "egresados":
                    List<EgresadoDTO> egresados = egresadoService.findAllEgresadosFiltered(
                            carrera, fechaInicio, fechaFin, null, null);
                    reportBytes = reporteService.exportarEgresadosBytes(egresados, formato);
                    filename = "egresados_" + LocalDate.now().format(DateTimeFormatter.ISO_DATE);
                    break;
                case "genero":
                    List<Object[]> datosGenero = egresadoRepository.countByGenero(carrera, yearInicio, yearFin);
                    if (carrera != null && !carrera.isEmpty() && !"all".equalsIgnoreCase(carrera)) {
                        List<Object[]> datosGeneroConCarrera = new ArrayList<>();
                        for (Object[] row : datosGenero) {
                            Object[] newRow = new Object[3];
                            newRow[0] = row[0];
                            newRow[1] = row[1];
                            newRow[2] = carrera;
                            datosGeneroConCarrera.add(newRow);
                        }
                        datosGenero = datosGeneroConCarrera;
                    }
                    reportBytes = reporteService.generarReporteGenero(datosGenero, formato);
                    filename = "genero_" + LocalDate.now().format(DateTimeFormatter.ISO_DATE);
                    break;
                case "empleabilidad":
                    List<Object[]> datosEmpleabilidad = egresadoRepository.countEmpleabilidadPorCarrera(carrera, yearInicio, yearFin);
                    reportBytes = reporteService.generarReporteEmpleabilidad(datosEmpleabilidad, formato);
                    filename = "empleabilidad_" + LocalDate.now().format(DateTimeFormatter.ISO_DATE);
                    break;
                case "salarios":
                    List<Object[]> datosSalarios = egresadoRepository.getSalarioPromedioRealPorCarreraFull(carrera, yearInicio, yearFin, estado, sede);
                    reportBytes = reporteService.generarReporteSalarios(datosSalarios, formato);
                    filename = "salarios_" + LocalDate.now().format(DateTimeFormatter.ISO_DATE);
                    break;
                case "satisfaccion":
                    List<Object[]> datosSatisfaccion;
                    if (carrera != null && !carrera.isEmpty() && !"all".equalsIgnoreCase(carrera)) {
                        datosSatisfaccion = egresadoRepository.averageSatisfaccionByCarreraAgrupadoFiltro(carrera, yearInicio, yearFin, estado, sede);
                        List<Object[]> datosConCarrera = new ArrayList<>();
                        for (Object[] row : datosSatisfaccion) {
                            Object[] newRow = new Object[3];
                            newRow[0] = row[0];
                            newRow[1] = row[1];
                            newRow[2] = carrera;
                            datosConCarrera.add(newRow);
                        }
                        datosSatisfaccion = datosConCarrera;
                    } else {
                        datosSatisfaccion = egresadoRepository.averageSatisfaccionByCarreraAgrupadoFiltro(null, yearInicio, yearFin, estado, sede);
                    }
                    reportBytes = reporteService.generarReporteSatisfaccion(datosSatisfaccion, formato);
                    filename = "satisfaccion_" + LocalDate.now().format(DateTimeFormatter.ISO_DATE);
                    break;
                case "experiencias_laborales":
                    List<Map<String, Object>> agrupado = reporteService.obtenerExperienciasLaboralesAgrupadasPorEgresado(
                        carrera,
                        estado,
                        sede,
                        fechaInicio != null ? fechaInicio.toString() : null,
                        fechaFin != null ? fechaFin.toString() : null,
                        null
                    );
                    if (formato.equalsIgnoreCase("excel")) {
                        reportBytes = reporteService.exportarExperienciasLaboralesAgrupadasExcel(agrupado);
                    } else {
                        reportBytes = reporteService.exportarExperienciasLaboralesAgrupadasPDF(agrupado);
                    }
                    filename = "experiencias_laborales_" + LocalDate.now().format(DateTimeFormatter.ISO_DATE);
                    break;
                default:
                    return ResponseEntity.badRequest().build();
            }

            // Guardar archivo en carpeta local
            nombreArchivo = filename + "_" + System.currentTimeMillis() + extension;
            Path rutaArchivo = Paths.get(carpetaExport, nombreArchivo);
            Files.createDirectories(rutaArchivo.getParent());
            Files.write(rutaArchivo, reportBytes);

            // Construir URL pública (asumiendo recurso estático)
            urlArchivo = "/exports/" + nombreArchivo;
            System.out.println("[EXPORT] nombreArchivo: " + nombreArchivo);
            System.out.println("[EXPORT] urlArchivo: " + urlArchivo);
            System.out.println("[EXPORT] rutaArchivo absoluta: " + rutaArchivo.toAbsolutePath());

            // Serializar parámetros como JSON
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            Map<String, Object> parametrosMap = new HashMap<>();
            parametrosMap.put("career", carrera);
            parametrosMap.put("startDate", fechaInicio);
            parametrosMap.put("endDate", fechaFin);
            parametrosMap.put("estado", estado);
            parametrosMap.put("sede", sede);
            String parametrosJson = mapper.writeValueAsString(parametrosMap);

            // Guardar en la base de datos
            com.utp.utptrack.Models.ReporteGuardado reporteGuardado = reporteGuardadoService.guardarReporte(
                usuarioId, type, parametrosJson, urlArchivo, "guardado"
            );

            return ResponseEntity.ok(reporteGuardado);
        } catch (Exception e) {
            System.out.println("[EXPORT] Excepción al exportar y guardar: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint para obtener datos de empleabilidad por carrera
    @GetMapping("/empleabilidad")
    public ResponseEntity<List<Map<String, Object>>> getEmpleabilidadPorCarrera(
            @RequestParam(required = false) String carrera,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        try {
            Integer yearInicio = fechaInicio != null ? fechaInicio.getYear() : null;
            Integer yearFin = fechaFin != null ? fechaFin.getYear() : null;

            List<Object[]> data = egresadoRepository.countEmpleabilidadPorCarrera(carrera, yearInicio, yearFin);

            if (data.isEmpty()) {
                // Datos estáticos de ejemplo como fallback
                List<Map<String, Object>> fallbackData = new ArrayList<>();
                fallbackData.add(createEmploymentDataMap("Ing. Sistemas", 85L, 15L));
                fallbackData.add(createEmploymentDataMap("Ing. Industrial", 80L, 20L));
                fallbackData.add(createEmploymentDataMap("Ing. Civil", 75L, 25L));
                fallbackData.add(createEmploymentDataMap("Administración", 70L, 30L));
                fallbackData.add(createEmploymentDataMap("Contabilidad", 78L, 22L));
                fallbackData.add(createEmploymentDataMap("Marketing", 65L, 35L));
                return new ResponseEntity<>(fallbackData, HttpStatus.OK);
            }

            List<Map<String, Object>> result = data.stream().map(row -> {
                Map<String, Object> item = new HashMap<>();
                item.put("name", row[0]);
                item.put("empleados", row[1]);
                item.put("desempleados", row[2]);
                return item;
            }).collect(Collectors.toList());

            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            // Datos estáticos de ejemplo como fallback
            List<Map<String, Object>> fallbackData = new ArrayList<>();
            fallbackData.add(createEmploymentDataMap("Ing. Sistemas", 85L, 15L));
            fallbackData.add(createEmploymentDataMap("Ing. Industrial", 80L, 20L));
            fallbackData.add(createEmploymentDataMap("Ing. Civil", 75L, 25L));
            fallbackData.add(createEmploymentDataMap("Administración", 70L, 30L));
            fallbackData.add(createEmploymentDataMap("Contabilidad", 78L, 22L));
            fallbackData.add(createEmploymentDataMap("Marketing", 65L, 35L));
            return new ResponseEntity<>(fallbackData, HttpStatus.OK);
        }
    }

    // Endpoint para obtener datos de salarios
    @GetMapping("/salarios")
    public ResponseEntity<List<Map<String, Object>>> getSalariosPorCarrera(
            @RequestParam(required = false) String carrera) {
        try {
            List<Object[]> data;
            if (carrera == null || carrera.isEmpty() || "all".equalsIgnoreCase(carrera)) {
                data = egresadoRepository.getSalarioPromedioRealPorCarrera(null);
            } else {
                data = egresadoRepository.getSalarioPromedioRealPorCarrera(carrera);
            }
            List<Map<String, Object>> result = data.stream().map(row -> {
                Map<String, Object> item = new HashMap<>();
                item.put("name", row[0]);
                item.put("salario", row[1]);
                return item;
            }).collect(Collectors.toList());
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    // Endpoint para obtener datos de distribución por género
    @GetMapping("/genero")
    public ResponseEntity<List<Map<String, Object>>> getDistribucionPorGenero(
            @RequestParam(required = false) String carrera,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        try {
            Integer yearInicio = fechaInicio != null ? fechaInicio.getYear() : null;
            Integer yearFin = fechaFin != null ? fechaFin.getYear() : null;

            List<Object[]> data = egresadoRepository.countByGenero(carrera, yearInicio, yearFin);

            if (data.isEmpty()) {
                // Datos estáticos de ejemplo como fallback
                List<Map<String, Object>> fallbackData = new ArrayList<>();
                fallbackData.add(createGenderDataMap("M", 58L));
                fallbackData.add(createGenderDataMap("F", 42L));
                return new ResponseEntity<>(fallbackData, HttpStatus.OK);
            }

            List<Map<String, Object>> result = data.stream().map(row -> {
                Map<String, Object> item = new HashMap<>();
                item.put("name", row[0]);  // Mantener el formato original de la BD (M, F)
                item.put("value", row[1]);
                return item;
            }).collect(Collectors.toList());

            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            // Datos estáticos de ejemplo como fallback
            List<Map<String, Object>> fallbackData = new ArrayList<>();
            fallbackData.add(createGenderDataMap("M", 58L));
            fallbackData.add(createGenderDataMap("F", 42L));
            return new ResponseEntity<>(fallbackData, HttpStatus.OK);
        }
    }

    // Endpoint para satisfacción por carrera
    @GetMapping("/satisfaccion")
    public ResponseEntity<List<Map<String, Object>>> getSatisfaccionPorCarrera(
            @RequestParam(required = false) String carrera,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String sede) {

        try {
            Integer yearInicio = fechaInicio != null ? fechaInicio.getYear() : null;
            Integer yearFin = fechaFin != null ? fechaFin.getYear() : null;

            List<Object[]> data;
            if (carrera != null && !carrera.isEmpty() && !"all".equalsIgnoreCase(carrera)) {
                data = egresadoRepository.averageSatisfaccionByCarreraAgrupadoFiltro(carrera, yearInicio, yearFin, estado, sede);
            } else {
                data = egresadoRepository.averageSatisfaccionByCarreraAgrupadoFiltro(null, yearInicio, yearFin, estado, sede);
            }

            List<Map<String, Object>> result = data.stream().map(row -> {
                Map<String, Object> item = new HashMap<>();
                item.put("carrera", row[0]);
                item.put("satisfaccion", row[1]);
                return item;
            }).collect(Collectors.toList());

            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/sedes")
    public ResponseEntity<List<Map<String, Object>>> getDistribucionPorSede(
            @RequestParam(required = false) String carrera,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        try {
            Integer yearInicio = fechaInicio != null ? fechaInicio.getYear() : null;
            Integer yearFin = fechaFin != null ? fechaFin.getYear() : null;

            List<Object[]> data = egresadoRepository.countBySede(carrera, yearInicio, yearFin);

            List<Map<String, Object>> result = data.stream().map(row -> {
                Map<String, Object> item = new HashMap<>();
                item.put("sede", row[0]);
                item.put("cantidad", row[1]);
                return item;
            }).collect(Collectors.toList());

            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> getEstadisticasGenerales(
            @RequestParam(required = false) String carrera,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        try {
            Integer yearInicio = fechaInicio != null ? fechaInicio.getYear() : null;
            Integer yearFin = fechaFin != null ? fechaFin.getYear() : null;

            Map<String, Object> stats = new HashMap<>();

            Long empleados = egresadoRepository.countEmpleadosByParameters(carrera, yearInicio, yearFin);
            Long desempleados = egresadoRepository.countDesempleadosByParameters(carrera, yearInicio, yearFin);
            Double satisfaccion = egresadoRepository.averageSatisfaccionByCarrera(carrera, yearInicio, yearFin);

            stats.put("totalEmpleados", empleados);
            stats.put("totalDesempleados", desempleados);
            stats.put("tasaEmpleabilidad", empleados.doubleValue() / (empleados + desempleados));
            stats.put("satisfaccionPromedio", satisfaccion);

            return new ResponseEntity<>(stats, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/tendencia-empleabilidad")
    public ResponseEntity<Map<String, Object>> getTendenciaEmpleabilidad(
            @RequestParam(required = false) String carrera,
            @RequestParam(defaultValue = "5") Integer ultimosAnios) {

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Endpoint no implementado completamente. Requiere una consulta temporal.");

        return new ResponseEntity<>(response, HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping("/salario-promedio-real")
    public ResponseEntity<Map<String, Object>> getSalarioPromedioReal(
            @RequestParam(required = false) String carrera) {
        try {
            List<Object[]> data = egresadoRepository.getSalarioPromedioRealPorCarrera(carrera);
            double salario = 0;
            if (!data.isEmpty()) {
                salario = data.get(0)[1] != null ? ((Number) data.get(0)[1]).doubleValue() : 0;
            }
            Map<String, Object> result = new HashMap<>();
            result.put("carrera", carrera);
            result.put("salarioPromedio", salario);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "No se pudo calcular el salario promedio real"));
        }
    }

    @GetMapping("/habilidades-demandadas")
    public ResponseEntity<Map<String, Object>> getHabilidadesDemandadasPorCarrera(@RequestParam String carrera) {
        try {
            List<Egresado> egresados = egresadoRepository.findAll().stream()
                .filter(e -> carrera == null || carrera.isEmpty() || "all".equalsIgnoreCase(carrera) || carrera.equalsIgnoreCase(e.getCarrera()))
                .toList();

            Map<String, Integer> tecnicas = new HashMap<>();
            Map<String, Integer> blandas = new HashMap<>();

            for (Egresado e : egresados) {
                // Técnicas
                if (e.getHabilidadesTecnicas() != null && !e.getHabilidadesTecnicas().isEmpty()) {
                    try {
                        List<String> lista = parseJsonArray(e.getHabilidadesTecnicas());
                        for (String h : lista) {
                            tecnicas.put(h, tecnicas.getOrDefault(h, 0) + 1);
                        }
                    } catch (Exception ex) { /* ignorar errores de parseo */ }
                }
                // Blandas
                if (e.getHabilidadesBlandas() != null && !e.getHabilidadesBlandas().isEmpty()) {
                    try {
                        List<String> lista = parseJsonArray(e.getHabilidadesBlandas());
                        for (String h : lista) {
                            blandas.put(h, blandas.getOrDefault(h, 0) + 1);
                        }
                    } catch (Exception ex) { /* ignorar errores de parseo */ }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("tecnicas", sortByValueDesc(tecnicas));
            result.put("blandas", sortByValueDesc(blandas));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "No se pudo calcular las habilidades demandadas"));
        }
    }

    // Auxiliar para parsear JSON array simple (usando Jackson)
    private List<String> parseJsonArray(String json) throws Exception {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        return mapper.readValue(json, mapper.getTypeFactory().constructCollectionType(List.class, String.class));
    }

    // Auxiliar para ordenar un map por valor descendente
    private List<Map.Entry<String, Integer>> sortByValueDesc(Map<String, Integer> map) {
        return map.entrySet().stream()
            .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
            .toList();
    }

    // Métodos auxiliares para crear mapas de datos
    private Map<String, Object> createEmploymentDataMap(String name, Long empleados, Long desempleados) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", name);
        map.put("empleados", empleados);
        map.put("desempleados", desempleados);
        return map;
    }

    private Map<String, Object> createSalaryDataMap(String name, Double salario) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", name);
        map.put("salario", salario);
        return map;
    }

    private Map<String, Object> createGenderDataMap(String name, Long value) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", name);
        map.put("value", value);
        return map;
    }

    @GetMapping("/exportar-dashboard")
    public void exportarDashboard(
            HttpServletResponse response,
            @RequestParam String type,
            @RequestParam(defaultValue = "pdf") String formato,
            @RequestParam(required = false) String carrera,
            @RequestParam(required = false) String periodo) throws IOException {

        response.setContentType(formato.equals("excel") ?
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
                "application/pdf");

        String filename = "dashboard_" + type + "_" + LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String headerValue = "attachment; filename=" + filename + (formato.equals("excel") ? ".xlsx" : ".pdf");
        response.setHeader("Content-Disposition", headerValue);

        reporteService.exportarDashboardCompleto(response, type, carrera, periodo, formato);
    }

    @GetMapping("/exportar-grafico")
    public void exportarGrafico(
            HttpServletResponse response,
            @RequestParam String type,
            @RequestParam(defaultValue = "pdf") String formato,
            @RequestParam(required = false) String carrera) throws IOException {

        response.setContentType(formato.equals("excel") ?
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
                "application/pdf");

        String filename = "grafico_" + type + "_" + LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String headerValue = "attachment; filename=" + filename + (formato.equals("excel") ? ".xlsx" : ".pdf");
        response.setHeader("Content-Disposition", headerValue);

        reporteService.exportarGrafico(response, type, carrera, formato);
    }

    @GetMapping("/tendencias-empleabilidad")
    public ResponseEntity<List<Map<String, Object>>> getTendenciasEmpleabilidad(
            @RequestParam(required = false) String carrera,
            @RequestParam(defaultValue = "5") Integer ultimosAnios) {

        try {
            List<Map<String, Object>> tendencias = new ArrayList<>();
            
            // Generar datos de tendencia por año (simulado con datos reales)
            for (int i = ultimosAnios; i >= 1; i--) {
                Integer year = LocalDate.now().getYear() - i;
                
                Long empleados = egresadoRepository.countEmpleadosByParameters(carrera, year, year);
                Long desempleados = egresadoRepository.countDesempleadosByParameters(carrera, year, year);
                Double satisfaccion = egresadoRepository.averageSatisfaccionByCarrera(carrera, year, year);
                
                Map<String, Object> tendencia = new HashMap<>();
                tendencia.put("año", year);
                tendencia.put("empleados", empleados);
                tendencia.put("desempleados", desempleados);
                tendencia.put("tasaEmpleabilidad", empleados.doubleValue() / (empleados + desempleados));
                tendencia.put("satisfaccion", satisfaccion);
                
                tendencias.add(tendencia);
            }
            
            return ResponseEntity.ok(tendencias);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint para exportar reportes directamente (sin guardar)
    @GetMapping("/exportar")
    public void exportarReporte(
            HttpServletResponse response,
            @RequestParam String type,
            @RequestParam(required = false) String carrera,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String sede,
            @RequestParam(defaultValue = "pdf") String formato) throws IOException {

        System.out.println("[EXPORTAR] Parámetros recibidos:");
        System.out.println("[EXPORTAR] type: " + type);
        System.out.println("[EXPORTAR] carrera: " + carrera);
        System.out.println("[EXPORTAR] fechaInicio: " + fechaInicio);
        System.out.println("[EXPORTAR] fechaFin: " + fechaFin);
        System.out.println("[EXPORTAR] estado: " + estado);
        System.out.println("[EXPORTAR] sede: " + sede);
        System.out.println("[EXPORTAR] formato: " + formato);

        try {
            Integer yearInicio = fechaInicio != null ? fechaInicio.getYear() : null;
            Integer yearFin = fechaFin != null ? fechaFin.getYear() : null;

            // Configurar headers de respuesta
            response.setContentType(formato.equalsIgnoreCase("excel") || formato.equalsIgnoreCase("xlsx") ?
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
                    "application/pdf");

            String timestamp = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String filename = type + "_" + timestamp;
            String extension = formato.equalsIgnoreCase("excel") || formato.equalsIgnoreCase("xlsx") ? ".xlsx" : ".pdf";
            String headerValue = "attachment; filename=" + filename + extension;
            response.setHeader("Content-Disposition", headerValue);

            byte[] reportBytes;

            switch (type) {
                case "lista_egresados":
                case "egresados":
                    List<EgresadoDTO> egresados = egresadoService.findAllEgresadosFiltered(
                            carrera, fechaInicio, fechaFin, estado, sede);
                    System.out.println("[EXPORTAR] Egresados encontrados: " + egresados.size());
                    reportBytes = reporteService.exportarEgresadosBytes(egresados, formato);
                    break;
                case "empleabilidad":
                    List<Object[]> datosEmpleabilidad = egresadoRepository.countEmpleabilidadPorCarrera(carrera, yearInicio, yearFin);
                    // Aplicar filtro de sede si es necesario
                    if (sede != null && !sede.isEmpty() && !"all".equalsIgnoreCase(sede)) {
                        datosEmpleabilidad = aplicarFiltroSede(datosEmpleabilidad, sede);
                    }
                    System.out.println("[EXPORTAR] Datos empleabilidad: " + datosEmpleabilidad.size());
                    reportBytes = reporteService.generarReporteEmpleabilidad(datosEmpleabilidad, formato);
                    break;
                case "genero":
                    List<Object[]> datosGenero = egresadoRepository.countByGenero(carrera, yearInicio, yearFin);
                    // Aplicar filtro de sede si es necesario
                    if (sede != null && !sede.isEmpty() && !"all".equalsIgnoreCase(sede)) {
                        datosGenero = aplicarFiltroSede(datosGenero, sede);
                    }
                    System.out.println("[EXPORTAR] Datos género: " + datosGenero.size());
                    reportBytes = reporteService.generarReporteGenero(datosGenero, formato);
                    break;
                case "salarios":
                    List<Object[]> datosSalarios = egresadoRepository.getSalarioPromedioRealPorCarreraFull(carrera, yearInicio, yearFin, estado, sede);
                    System.out.println("[EXPORTAR] Datos salarios: " + datosSalarios.size());
                    reportBytes = reporteService.generarReporteSalarios(datosSalarios, formato);
                    break;
                case "satisfaccion":
                    List<Object[]> datosSatisfaccion = egresadoRepository.averageSatisfaccionByCarreraAgrupadoFiltro(carrera, yearInicio, yearFin, estado, sede);
                    System.out.println("[EXPORTAR] Datos satisfacción: " + datosSatisfaccion.size());
                    reportBytes = reporteService.generarReporteSatisfaccion(datosSatisfaccion, formato);
                    break;
                case "ubicacion":
                    // Para ubicación, obtener datos agrupados por sede
                    List<Object[]> datosUbicacion = egresadoRepository.countBySede(carrera, yearInicio, yearFin);
                    // Aplicar filtro de sede si es necesario
                    if (sede != null && !sede.isEmpty() && !"all".equalsIgnoreCase(sede)) {
                        datosUbicacion = datosUbicacion.stream()
                            .filter(row -> sede.equalsIgnoreCase((String) row[0]))
                            .collect(Collectors.toList());
                    }
                    System.out.println("[EXPORTAR] Datos ubicación: " + datosUbicacion.size());
                    reportBytes = reporteService.generarReporteUbicacion(datosUbicacion, formato);
                    break;
                default:
                    throw new IllegalArgumentException("Tipo de reporte no válido: " + type);
            }

            // Escribir bytes al response
            response.getOutputStream().write(reportBytes);
            response.getOutputStream().flush();

        } catch (Exception e) {
            System.err.println("[EXPORTAR] Error al exportar reporte: " + e.getMessage());
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error al generar el reporte: " + e.getMessage());
        }
    }

    // Método auxiliar para aplicar filtro de sede a datos generales
    private List<Object[]> aplicarFiltroSede(List<Object[]> datos, String sede) {
        // Para datos que no incluyen sede directamente, necesitamos consultar egresados por sede
        List<EgresadoDTO> egresadosPorSede = egresadoService.findAllEgresadosFiltered(null, null, null, null, sede);
        Set<String> carrerasEnSede = egresadosPorSede.stream()
            .map(EgresadoDTO::getCarrera)
            .collect(Collectors.toSet());
        
        return datos.stream()
            .filter(row -> carrerasEnSede.contains((String) row[0]))
            .collect(Collectors.toList());
    }

    @GetMapping("/experiencias-laborales")
    public ResponseEntity<?> getExperienciasLaborales(
            @RequestParam(required = false) String carrera,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String sede,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin,
            @RequestParam(required = false) String search
    ) {
        System.out.println("[EXPERIENCIAS-LABORALES] Endpoint llamado con params: carrera=" + carrera + ", estado=" + estado + ", sede=" + sede + ", fechaInicio=" + fechaInicio + ", fechaFin=" + fechaFin + ", search=" + search);
        try {
            List<Map<String, Object>> agrupado = reporteService.obtenerExperienciasLaboralesAgrupadasPorEgresado(
                carrera, estado, sede, fechaInicio, fechaFin, search
            );
            return ResponseEntity.ok(agrupado);
        } catch (Exception e) {
            System.out.println("[EXPERIENCIAS-LABORALES] Excepción: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}