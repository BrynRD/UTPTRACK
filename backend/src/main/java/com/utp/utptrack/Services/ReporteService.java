package com.utp.utptrack.Services;

import com.itextpdf.text.*;
import com.itextpdf.text.Font;
import com.utp.utptrack.dto.EgresadoDTO;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

// Importaciones específicas de iText para evitar ambigüedad
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import com.utp.utptrack.Models.ExperienciaLaboral;
import com.utp.utptrack.Models.Egresado;
import com.utp.utptrack.Repositories.ExperienciaLaboralRepository;
import java.util.Map;
import java.util.HashMap;

@Service
public class ReporteService {

    private final EgresadoService egresadoService;
    private final ExperienciaLaboralRepository experienciaLaboralRepository;

    public ReporteService(EgresadoService egresadoService, ExperienciaLaboralRepository experienciaLaboralRepository) {
        this.egresadoService = egresadoService;
        this.experienciaLaboralRepository = experienciaLaboralRepository;
    }

    // Método existente para exportar egresados
    public void exportarEgresados(
            HttpServletResponse response,
            String carrera,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String estado,
            String sede,
            String formato) throws IOException {
        List<EgresadoDTO> egresados = egresadoService.findAllEgresadosFiltered(
                carrera, fechaInicio, fechaFin, estado, sede);

        if (formato.equals("excel")) {
            exportarExcel(response, egresados);
        } else {
            exportarPDF(response, egresados);
        }
    }

    private void exportarExcel(HttpServletResponse response, List<EgresadoDTO> egresados) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Egresados");
            int rowNum = 0;

            // Insertar logo
            try {
                String logoPath = "C:/Users/bryn/Desktop/UTPTRACK/frontend/public/logo.png";
                InputStream is = new java.io.FileInputStream(logoPath);
                byte[] bytes = is.readAllBytes();
                int pictureIdx = workbook.addPicture(bytes, Workbook.PICTURE_TYPE_PNG);
                is.close();
                CreationHelper helper = workbook.getCreationHelper();
                Drawing<?> drawing = sheet.createDrawingPatriarch();
                ClientAnchor anchor = helper.createClientAnchor();
                anchor.setCol1(0);
                anchor.setRow1(rowNum);
                Picture pict = drawing.createPicture(anchor, pictureIdx);
                pict.resize(2, 2); // Ajusta el tamaño del logo
                rowNum += 4; // Deja espacio después del logo
            } catch (Exception e) {
                // Si falla el logo, continuar sin él
            }

            // Cabecera con color morado institucional
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.VIOLET.getIndex()); // #5b36f2 aproximado
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);

            String[] headers = {"ID", "Nombre Completo", "Email", "DNI", "Carrera", "Año Egreso", "Estado", "Sede", "Teléfono"};
            Row headerRow = sheet.createRow(rowNum++);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Estilos para filas alternas
            CellStyle evenRowStyle = workbook.createCellStyle();
            evenRowStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            evenRowStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            CellStyle oddRowStyle = workbook.createCellStyle();
            oddRowStyle.setFillForegroundColor(IndexedColors.WHITE.getIndex());
            oddRowStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Congelar cabecera
            sheet.createFreezePane(0, rowNum);

            // Datos
            int dataRowNum = 0;
            for (EgresadoDTO egresado : egresados) {
                Row row = sheet.createRow(rowNum);
                CellStyle rowStyle = (dataRowNum % 2 == 0) ? evenRowStyle : oddRowStyle;
                int col = 0;
                row.createCell(col).setCellValue(egresado.getId() != null ? egresado.getId() : ""); col++;
                String nombreCompleto = (egresado.getNombre() != null ? egresado.getNombre() : "") + " " + (egresado.getApellido() != null ? egresado.getApellido() : "");
                row.createCell(col).setCellValue(nombreCompleto.trim()); col++;
                row.createCell(col).setCellValue(egresado.getEmail() != null ? egresado.getEmail() : ""); col++;
                row.createCell(col).setCellValue(egresado.getDni() != null ? egresado.getDni() : ""); col++;
                row.createCell(col).setCellValue(egresado.getCarrera() != null ? egresado.getCarrera() : ""); col++;
                row.createCell(col).setCellValue(egresado.getAnioEgreso() != null ? String.valueOf(egresado.getAnioEgreso()) : ""); col++;
                row.createCell(col).setCellValue(egresado.getEstadoLaboral() != null ? egresado.getEstadoLaboral() : ""); col++;
                row.createCell(col).setCellValue(egresado.getSede() != null ? egresado.getSede() : ""); col++;
                String telefono = egresado.getTelefono() != null ? egresado.getTelefono() : "";
                row.createCell(col).setCellValue(telefono);
                for (int i = 0; i < headers.length; i++) {
                    row.getCell(i).setCellStyle(rowStyle);
                }
                dataRowNum++;
                rowNum++;
            }
            // Autoajustar columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            // Pie de página con total
            Row footerRow = sheet.createRow(rowNum + 1);
            Cell footerCell = footerRow.createCell(0);
            footerCell.setCellValue("Total de egresados: " + egresados.size());
            // Escribir al response
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=egresados.xlsx");
            workbook.write(response.getOutputStream());
        } catch (IOException e) {
            throw new RuntimeException("Error al exportar Excel", e);
        }
    }

    // Nuevo método para generar reportes estadísticos como byte[]
    public byte[] generarReporteGenero(List<Object[]> datos, String formato) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();



        if ("excel".equalsIgnoreCase(formato)) {
            // Generar Excel con Apache POI
            try (Workbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("Distribución por Género");

                // Estilo para cabecera
                CellStyle headerStyle = workbook.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.GREY_50_PERCENT.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerFont.setColor(IndexedColors.WHITE.getIndex());
                headerStyle.setFont(headerFont);

                // Cabeceras
                Row headerRow = sheet.createRow(0);
                Cell cellGenero = headerRow.createCell(0);
                cellGenero.setCellValue("Género");
                cellGenero.setCellStyle(headerStyle);

                Cell cellCantidad = headerRow.createCell(1);
                cellCantidad.setCellValue("Cantidad");
                cellCantidad.setCellStyle(headerStyle);

                // Datos
                int rowNum = 1;
                for (Object[] row : datos) {
                    Row dataRow = sheet.createRow(rowNum++);
                    String genero = (String) row[0];
                    // Traducir M y F a nombres completos
                    dataRow.createCell(0).setCellValue("M".equals(genero) ? "Masculino" : "F".equals(genero) ? "Femenino" : genero);
                    dataRow.createCell(1).setCellValue(((Number)row[1]).doubleValue());
                }

                // Autoajustar columnas
                sheet.autoSizeColumn(0);
                sheet.autoSizeColumn(1);

                workbook.write(baos);
            }
        } else {
            // Generar PDF con iText
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();
            agregarLogo(document);


            // Título del documento
            com.itextpdf.text.Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
            Paragraph titulo = new Paragraph("Reporte de Distribución por Género", tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(10);
            document.add(titulo);

            // Mostrar carrera si está disponible
            if (datos != null && !datos.isEmpty() && datos.get(0).length > 2 && datos.get(0)[2] != null) {
                com.itextpdf.text.Font carreraFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.DARK_GRAY);
                Paragraph carreraParrafo = new Paragraph("Carrera: " + datos.get(0)[2], carreraFont);
                carreraParrafo.setAlignment(Element.ALIGN_CENTER);
                carreraParrafo.setSpacingAfter(10);
                document.add(carreraParrafo);
            }

            // Fecha de generación
            com.itextpdf.text.Font fechaFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.DARK_GRAY);
            Paragraph fecha = new Paragraph("Fecha de generación: " + LocalDate.now().toString(), fechaFont);
            fecha.setAlignment(Element.ALIGN_RIGHT);
            fecha.setSpacingAfter(20);
            document.add(fecha);

            // Tabla
            PdfPTable tabla = new PdfPTable(2);
            tabla.setWidthPercentage(100);
            tabla.setSpacingBefore(10);

            // Encabezados de la tabla
            com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE);

            PdfPCell cellHeader = new PdfPCell();
            cellHeader.setBackgroundColor(new BaseColor(55, 55, 55));
            cellHeader.setPadding(5);

            cellHeader.setPhrase(new Phrase("Género", headerFont));
            tabla.addCell(cellHeader);

            cellHeader.setPhrase(new Phrase("Cantidad", headerFont));
            tabla.addCell(cellHeader);

            // Datos
            com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 11);

            int total = 0;
            for (Object[] row : datos) {
                String genero = (String) row[0];
                int cantidad = ((Number) row[1]).intValue();
                total += cantidad;

                // Traducir M y F a nombres completos para mejor legibilidad
                tabla.addCell(new Phrase("M".equals(genero) ? "Masculino" : "F".equals(genero) ? "Femenino" : genero, dataFont));
                tabla.addCell(new Phrase(String.valueOf(cantidad), dataFont));
            }

            document.add(tabla);

            // Agregar pie de página con total
            Paragraph resumen = new Paragraph("Total registros: " + total, fechaFont);
            resumen.setSpacingBefore(20);
            document.add(resumen);

            document.close();
        }

        return baos.toByteArray();
    }

    public byte[] generarReporteEmpleabilidad(List<Object[]> datos, String formato) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        if ("excel".equalsIgnoreCase(formato)) {
            try (Workbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("Empleabilidad por Carrera");

                // Estilo para cabecera
                CellStyle headerStyle = workbook.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.GREY_50_PERCENT.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerFont.setColor(IndexedColors.WHITE.getIndex());
                headerStyle.setFont(headerFont);

                // Cabeceras
                Row headerRow = sheet.createRow(0);
                Cell cellCarrera = headerRow.createCell(0);
                cellCarrera.setCellValue("Carrera");
                cellCarrera.setCellStyle(headerStyle);

                Cell cellEmpleados = headerRow.createCell(1);
                cellEmpleados.setCellValue("Empleados");
                cellEmpleados.setCellStyle(headerStyle);

                Cell cellDesempleados = headerRow.createCell(2);
                cellDesempleados.setCellValue("Desempleados");
                cellDesempleados.setCellStyle(headerStyle);

                Cell cellTotal = headerRow.createCell(3);
                cellTotal.setCellValue("Total");
                cellTotal.setCellStyle(headerStyle);

                Cell cellTasaEmpleo = headerRow.createCell(4);
                cellTasaEmpleo.setCellValue("Tasa Empleo (%)");
                cellTasaEmpleo.setCellStyle(headerStyle);

                // Datos
                int rowNum = 1;
                for (Object[] row : datos) {
                    Row dataRow = sheet.createRow(rowNum++);
                    String carrera = (String) row[0];
                    long empleados = ((Number) row[1]).longValue();
                    long desempleados = ((Number) row[2]).longValue();
                    long total = empleados + desempleados;
                    double tasaEmpleo = total > 0 ? (empleados * 100.0 / total) : 0;

                    dataRow.createCell(0).setCellValue(carrera);
                    dataRow.createCell(1).setCellValue(empleados);
                    dataRow.createCell(2).setCellValue(desempleados);
                    dataRow.createCell(3).setCellValue(total);
                    dataRow.createCell(4).setCellValue(String.format("%.2f", tasaEmpleo));
                }

                // Autoajustar columnas
                for (int i = 0; i < 5; i++) {
                    sheet.autoSizeColumn(i);
                }

                workbook.write(baos);
            }
        } else {
            // Generar PDF con iText
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Título
            com.itextpdf.text.Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
            Paragraph titulo = new Paragraph("Reporte de Empleabilidad por Carrera", tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(10);
            document.add(titulo);

            // Mostrar carrera si está disponible
            if (datos != null && !datos.isEmpty() && datos.get(0).length > 2 && datos.get(0)[2] != null) {
                com.itextpdf.text.Font carreraFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.DARK_GRAY);
                Paragraph carreraParrafo = new Paragraph("Carrera: " + datos.get(0)[2], carreraFont);
                carreraParrafo.setAlignment(Element.ALIGN_CENTER);
                carreraParrafo.setSpacingAfter(10);
                document.add(carreraParrafo);
            }

            // Fecha
            com.itextpdf.text.Font fechaFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.DARK_GRAY);
            Paragraph fecha = new Paragraph("Fecha de generación: " + LocalDate.now().toString(), fechaFont);
            fecha.setAlignment(Element.ALIGN_RIGHT);
            fecha.setSpacingAfter(20);
            document.add(fecha);

            // Tabla
            PdfPTable tabla = new PdfPTable(5);
            tabla.setWidthPercentage(100);
            float[] anchos = {3, 1.5f, 1.5f, 1.5f, 2};
            tabla.setWidths(anchos);

            // Encabezados
            com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE);
            PdfPCell cellHeader = new PdfPCell();
            cellHeader.setBackgroundColor(new BaseColor(55, 55, 55));
            cellHeader.setPadding(5);

            cellHeader.setPhrase(new Phrase("Carrera", headerFont));
            tabla.addCell(cellHeader);

            cellHeader.setPhrase(new Phrase("Empleados", headerFont));
            tabla.addCell(cellHeader);

            cellHeader.setPhrase(new Phrase("Desempleados", headerFont));
            tabla.addCell(cellHeader);

            cellHeader.setPhrase(new Phrase("Total", headerFont));
            tabla.addCell(cellHeader);

            cellHeader.setPhrase(new Phrase("Tasa Empleo (%)", headerFont));
            tabla.addCell(cellHeader);

            // Datos
            com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 11);

            int totalEmpleados = 0;
            int totalDesempleados = 0;

            for (Object[] row : datos) {
                String carrera = (String) row[0];
                int empleados = ((Number) row[1]).intValue();
                int desempleados = ((Number) row[2]).intValue();
                int total = empleados + desempleados;
                double tasaEmpleo = total > 0 ? (empleados * 100.0 / total) : 0;

                totalEmpleados += empleados;
                totalDesempleados += desempleados;

                tabla.addCell(new Phrase(carrera, dataFont));
                tabla.addCell(new Phrase(String.valueOf(empleados), dataFont));
                tabla.addCell(new Phrase(String.valueOf(desempleados), dataFont));
                tabla.addCell(new Phrase(String.valueOf(total), dataFont));
                tabla.addCell(new Phrase(String.format("%.2f", tasaEmpleo), dataFont));
            }

            document.add(tabla);

            // Resumen
            int totalGeneral = totalEmpleados + totalDesempleados;
            double tasaGeneralEmpleo = totalGeneral > 0 ? (totalEmpleados * 100.0 / totalGeneral) : 0;

            Paragraph resumen = new Paragraph("Resumen General:", fechaFont);
            resumen.setSpacingBefore(20);
            document.add(resumen);

            Paragraph empleabilidad = new Paragraph(
                    "Total Empleados: " + totalEmpleados +
                            "\nTotal Desempleados: " + totalDesempleados +
                            "\nTasa General de Empleo: " + String.format("%.2f%%", tasaGeneralEmpleo),
                    fechaFont);
            empleabilidad.setIndentationLeft(20);
            document.add(empleabilidad);

            document.close();
        }

        return baos.toByteArray();
    }

    public byte[] generarReporteSatisfaccion(List<Object[]> datos, String formato) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        if ("excel".equalsIgnoreCase(formato)) {
            try (Workbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("Satisfacción por Carrera");

                // Estilo para cabeceras
                CellStyle headerStyle = workbook.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.GREY_50_PERCENT.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerFont.setColor(IndexedColors.WHITE.getIndex());
                headerStyle.setFont(headerFont);

                // Cabeceras
                Row headerRow = sheet.createRow(0);
                Cell cellCarrera = headerRow.createCell(0);
                cellCarrera.setCellValue("Carrera");
                cellCarrera.setCellStyle(headerStyle);

                Cell cellSatisfaccion = headerRow.createCell(1);
                cellSatisfaccion.setCellValue("Nivel de Satisfacción (1-5)");
                cellSatisfaccion.setCellStyle(headerStyle);

                // Datos
                int rowNum = 1;
                for (Object[] row : datos) {
                    Row dataRow = sheet.createRow(rowNum++);
                    dataRow.createCell(0).setCellValue((String) row[0]);
                    dataRow.createCell(1).setCellValue(((Number) row[1]).doubleValue());
                }

                sheet.autoSizeColumn(0);
                sheet.autoSizeColumn(1);

                workbook.write(baos);
            }
        } else {
            // Código para generar PDF de satisfacción
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();
            agregarLogo(document);

            // Título
            com.itextpdf.text.Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
            Paragraph titulo = new Paragraph("Reporte de Satisfacción por Carrera", tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(10);
            document.add(titulo);

            // Mostrar carrera si está disponible
            if (datos != null && !datos.isEmpty() && datos.get(0).length > 2 && datos.get(0)[2] != null) {
                com.itextpdf.text.Font carreraFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.DARK_GRAY);
                Paragraph carreraParrafo = new Paragraph("Carrera: " + datos.get(0)[2], carreraFont);
                carreraParrafo.setAlignment(Element.ALIGN_CENTER);
                carreraParrafo.setSpacingAfter(10);
                document.add(carreraParrafo);
            }

            // Tabla
            PdfPTable tabla = new PdfPTable(2);
            tabla.setWidthPercentage(100);

            // Encabezados
            com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE);
            PdfPCell cellHeader = new PdfPCell();
            cellHeader.setBackgroundColor(new BaseColor(55, 55, 55));
            cellHeader.setPadding(5);

            cellHeader.setPhrase(new Phrase("Carrera", headerFont));
            tabla.addCell(cellHeader);

            cellHeader.setPhrase(new Phrase("Nivel de Satisfacción (1-5)", headerFont));
            tabla.addCell(cellHeader);

            // Datos
            com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
            double sumaSatisfaccion = 0;
            for (Object[] row : datos) {
                tabla.addCell(new Phrase((String) row[0], dataFont));
                double satisfaccion = ((Number) row[1]).doubleValue();
                sumaSatisfaccion += satisfaccion;
                tabla.addCell(new Phrase(String.format("%.2f", satisfaccion), dataFont));
            }

            document.add(tabla);

            // Promedio general
            double promedioGeneral = datos.size() > 0 ? sumaSatisfaccion / datos.size() : 0;
            Paragraph promedio = new Paragraph(
                    "Promedio general de satisfacción: " + String.format("%.2f", promedioGeneral),
                    FontFactory.getFont(FontFactory.HELVETICA, 11));
            promedio.setSpacingBefore(20);
            document.add(promedio);

            document.close();
        }

        return baos.toByteArray();
    }

    public byte[] generarReporteSalarios(List<Object[]> datos, String formato) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        if ("excel".equalsIgnoreCase(formato)) {
            try (Workbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("Salarios por Carrera");

                // Estilo para cabeceras
                CellStyle headerStyle = workbook.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.GREY_50_PERCENT.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerFont.setColor(IndexedColors.WHITE.getIndex());
                headerStyle.setFont(headerFont);

                // Cabeceras
                Row headerRow = sheet.createRow(0);
                Cell cellCarrera = headerRow.createCell(0);
                cellCarrera.setCellValue("Carrera");
                cellCarrera.setCellStyle(headerStyle);

                Cell cellSalario = headerRow.createCell(1);
                cellSalario.setCellValue("Salario Promedio (S/.)");
                cellSalario.setCellStyle(headerStyle);

                // Datos
                int rowNum = 1;
                for (Object[] row : datos) {
                    Row dataRow = sheet.createRow(rowNum++);
                    dataRow.createCell(0).setCellValue((String) row[0]);
                    dataRow.createCell(1).setCellValue(((Number) row[1]).doubleValue());
                }

                sheet.autoSizeColumn(0);
                sheet.autoSizeColumn(1);

                workbook.write(baos);
            }
        } else {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();
            agregarLogo(document);

            // Título
            com.itextpdf.text.Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
            Paragraph titulo = new Paragraph("Reporte de Salarios por Carrera", tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(10);
            document.add(titulo);

            // Fecha
            com.itextpdf.text.Font fechaFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.DARK_GRAY);
            Paragraph fecha = new Paragraph("Fecha de generación: " + LocalDate.now().toString(), fechaFont);
            fecha.setAlignment(Element.ALIGN_RIGHT);
            fecha.setSpacingAfter(20);
            document.add(fecha);

            // Tabla
            PdfPTable tabla = new PdfPTable(2);
            tabla.setWidthPercentage(100);

            // Encabezados
            com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE);
            PdfPCell cellHeader = new PdfPCell();
            cellHeader.setBackgroundColor(new BaseColor(55, 55, 55));
            cellHeader.setPadding(5);

            cellHeader.setPhrase(new Phrase("Carrera", headerFont));
            tabla.addCell(cellHeader);

            cellHeader.setPhrase(new Phrase("Salario Promedio (S/.)", headerFont));
            tabla.addCell(cellHeader);

            // Datos
            com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
            double sumaSalarios = 0;
            for (Object[] row : datos) {
                tabla.addCell(new Phrase((String) row[0], dataFont));
                double salario = ((Number) row[1]).doubleValue();
                sumaSalarios += salario;
                tabla.addCell(new Phrase(String.format("%.2f", salario), dataFont));
            }

            document.add(tabla);

            // Promedio general
            double promedioGeneral = datos.size() > 0 ? sumaSalarios / datos.size() : 0;
            Paragraph promedio = new Paragraph(
                    "Salario promedio general: S/. " + String.format("%.2f", promedioGeneral),
                    FontFactory.getFont(FontFactory.HELVETICA, 11));
            promedio.setSpacingBefore(20);
            document.add(promedio);

            document.close();
        }

        return baos.toByteArray();
    }


    public byte[] exportarEgresadosBytes(List<EgresadoDTO> egresados, String formato) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        // Verificar si la lista está vacía
        if (egresados == null || egresados.isEmpty()) {
            if (formato.equalsIgnoreCase("excel")) {
                try (Workbook workbook = new XSSFWorkbook()) {
                    Sheet sheet = workbook.createSheet("Egresados");
                    Row row = sheet.createRow(0);
                    Cell cell = row.createCell(0);
                    cell.setCellValue("No se encontraron egresados con los criterios especificados.");
                    workbook.write(baos);
                }
            } else {
                try {
                    Document document = new Document(PageSize.A4.rotate());
                    PdfWriter.getInstance(document, baos);
                    document.open();
                    agregarLogo(document);
                    Font font = FontFactory.getFont(FontFactory.HELVETICA, 12);
                    Paragraph p = new Paragraph("No se encontraron egresados con los criterios especificados.", font);
                    p.setAlignment(Element.ALIGN_CENTER);
                    document.add(p);
                    document.close();
                } catch (DocumentException e) {
                    throw new IOException("Error al generar PDF: " + e.getMessage(), e);
                }
            }
            return baos.toByteArray();
        }

        if (formato.equalsIgnoreCase("excel")) {
            try (Workbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("Egresados");
                // Cabeceras
                String[] headers = {"ID", "Nombre Completo", "Email", "DNI", "Carrera", "Año Egreso", "Estado Laboral", "Sede", "Teléfono"};
                Row headerRow = sheet.createRow(0);
                for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                }
                // Congelar la fila de cabecera
                sheet.createFreezePane(0, 1);
                // Llenar datos
                int rowNum = 1;
                for (EgresadoDTO egresado : egresados) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(egresado.getId() != null ? egresado.getId() : "");
                    String nombreCompleto = (egresado.getNombre() != null ? egresado.getNombre() : "") + " " + (egresado.getApellido() != null ? egresado.getApellido() : "");
                    row.createCell(1).setCellValue(nombreCompleto.trim());
                    row.createCell(2).setCellValue(egresado.getEmail() != null ? egresado.getEmail() : "");
                    row.createCell(3).setCellValue(egresado.getDni() != null ? egresado.getDni() : "");
                    row.createCell(4).setCellValue(egresado.getCarrera() != null ? egresado.getCarrera() : "");
                    row.createCell(5).setCellValue(
                        egresado.getAnioEgreso() != null ? String.valueOf(egresado.getAnioEgreso()) : ""
                    );
                    row.createCell(6).setCellValue(egresado.getEstadoLaboral() != null ? egresado.getEstadoLaboral() : "");
                    row.createCell(7).setCellValue(egresado.getSede() != null ? egresado.getSede() : "");
                    // Formato de teléfono
                    String telefono = egresado.getTelefono() != null ? egresado.getTelefono() : "";
                    row.createCell(8).setCellValue(telefono);
                }
                // Auto-ajustar ancho de columnas
                for (int i = 0; i < headers.length; i++) {
                    sheet.autoSizeColumn(i);
                }
                workbook.write(baos);
            }
        } else {
            try {
                Document document = new Document(PageSize.A4.rotate());
                PdfWriter writer = PdfWriter.getInstance(document, baos);
                document.open();
                agregarLogo(document);
                // Título
                Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
                Paragraph title = new Paragraph("Lista de Egresados", titleFont);
                title.setAlignment(Element.ALIGN_CENTER);
                document.add(title);
                // Info de registros
                Font infoFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.ITALIC);
                Paragraph info = new Paragraph("Total de registros: " + egresados.size(), infoFont);
                info.setAlignment(Element.ALIGN_RIGHT);
                document.add(info);
                document.add(new Paragraph(" "));
                // Tabla
                String[] headers = {"ID", "Nombre Completo", "Email", "DNI", "Carrera", "Año Egreso", "Estado", "Sede", "Teléfono"};
                PdfPTable table = new PdfPTable(headers.length);
                table.setWidthPercentage(100);
                float[] columnWidths = {0.5f, 2f, 2.5f, 1.2f, 2f, 1f, 1.2f, 1.2f, 1.5f};
                table.setWidths(columnWidths);
                // Cabecera con color
                Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.WHITE);
                for (String header : headers) {
                    PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    cell.setBackgroundColor(new BaseColor(55, 55, 55));
                    cell.setPadding(5);
                    table.addCell(cell);
                }
                // Filas alternas (zebra)
                Font rowFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
                int rowNum = 0;
                for (EgresadoDTO egresado : egresados) {
                    BaseColor bg = (rowNum % 2 == 0) ? BaseColor.WHITE : new BaseColor(240,240,240);
                    PdfPCell[] cells = new PdfPCell[headers.length];
                    cells[0] = new PdfPCell(new Phrase(egresado.getId() != null ? egresado.getId() : "", rowFont));
                    String nombreCompleto = (egresado.getNombre() != null ? egresado.getNombre() : "") + " " + (egresado.getApellido() != null ? egresado.getApellido() : "");
                    cells[1] = new PdfPCell(new Phrase(nombreCompleto.trim(), rowFont));
                    cells[2] = new PdfPCell(new Phrase(egresado.getEmail() != null ? egresado.getEmail() : "", rowFont));
                    cells[3] = new PdfPCell(new Phrase(egresado.getDni() != null ? egresado.getDni() : "", rowFont));
                    cells[4] = new PdfPCell(new Phrase(egresado.getCarrera() != null ? egresado.getCarrera() : "", rowFont));
                    cells[5] = new PdfPCell(new Phrase(egresado.getAnioEgreso() != null ? String.valueOf(egresado.getAnioEgreso()) : "", rowFont));
                    cells[6] = new PdfPCell(new Phrase(egresado.getEstadoLaboral() != null ? egresado.getEstadoLaboral() : "", rowFont));
                    cells[7] = new PdfPCell(new Phrase(egresado.getSede() != null ? egresado.getSede() : "", rowFont));
                    String telefono = egresado.getTelefono() != null ? egresado.getTelefono() : "";
                    cells[8] = new PdfPCell(new Phrase(telefono, rowFont));
                    for (PdfPCell cell : cells) {
                        cell.setBackgroundColor(bg);
                        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                        cell.setPadding(4);
                        table.addCell(cell);
                    }
                    rowNum++;
                }
                document.add(table);
                // Pie de página con fecha y paginación
                Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8, BaseColor.DARK_GRAY);
                Paragraph fecha = new Paragraph("Fecha de generación: " + LocalDate.now().toString(), footerFont);
                fecha.setAlignment(Element.ALIGN_RIGHT);
                document.add(fecha);
                document.close();
            } catch (DocumentException e) {
                throw new IOException("Error al generar PDF: " + e.getMessage(), e);
            }
        }
        return baos.toByteArray();
    }

    // Nuevos métodos para exportar dashboards y gráficos
    public void exportarDashboardCompleto(
            HttpServletResponse response,
            String type,
            String carrera,
            String periodo,
            String formato) throws IOException {

        if (formato.equals("excel")) {
            exportarDashboardExcel(response, type, carrera, periodo);
        } else {
            exportarDashboardPDF(response, type, carrera, periodo);
        }
    }

    public void exportarGrafico(
            HttpServletResponse response,
            String type,
            String carrera,
            String formato) throws IOException {

        if (formato.equals("excel")) {
            exportarGraficoExcel(response, type, carrera);
        } else {
            exportarGraficoPDF(response, type, carrera);
        }
    }

    private void exportarDashboardPDF(HttpServletResponse response, String type, String carrera, String periodo) throws IOException {
        try {
            Document documento = new Document(PageSize.A4, 36, 36, 54, 36);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(documento, baos);
            documento.open();

            // Título del dashboard
            Font tituloFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.DARK_GRAY);
            Paragraph titulo = new Paragraph("Dashboard de Estadísticas - " + type.toUpperCase(), tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(20);
            documento.add(titulo);

            // Información de filtros
            Font filtroFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.GRAY);
            String filtros = "Filtros aplicados: ";
            if (carrera != null && !carrera.isEmpty()) filtros += "Carrera: " + carrera + " | ";
            if (periodo != null && !periodo.isEmpty()) filtros += "Período: " + periodo + " | ";
            filtros += "Fecha de generación: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            
            Paragraph filtrosP = new Paragraph(filtros, filtroFont);
            filtrosP.setSpacingAfter(20);
            documento.add(filtrosP);

            // Obtener estadísticas para el dashboard
            List<EgresadoDTO> egresados = egresadoService.findAllEgresadosFiltered(carrera, null, null, null, null);
            
            // Tabla de KPIs principales
            PdfPTable tablaKPIs = new PdfPTable(2);
            tablaKPIs.setWidthPercentage(100);
            tablaKPIs.setSpacingAfter(20);

            Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.WHITE);
            Font dataFont = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL, BaseColor.BLACK);

            // Headers
            PdfPCell headerKPI = new PdfPCell(new Phrase("Indicador", headerFont));
            headerKPI.setBackgroundColor(BaseColor.DARK_GRAY);
            headerKPI.setPadding(10);
            tablaKPIs.addCell(headerKPI);

            PdfPCell headerValor = new PdfPCell(new Phrase("Valor", headerFont));
            headerValor.setBackgroundColor(BaseColor.DARK_GRAY);
            headerValor.setPadding(10);
            tablaKPIs.addCell(headerValor);

            // Datos de KPIs
            long totalEgresados = egresados.size();
            long empleados = egresados.stream().mapToLong(e -> "EMPLEADO".equals(e.getEstadoLaboral()) ? 1 : 0).sum();
            double tasaEmpleabilidad = totalEgresados > 0 ? (empleados * 100.0 / totalEgresados) : 0;
            double satisfaccionPromedio = egresados.stream()
                .filter(e -> e.getSatisfaccionFormacion() != null)
                .mapToDouble(e -> e.getSatisfaccionFormacion())
                .average()
                .orElse(0.0);

            String[][] kpiData = {
                {"Total de Egresados", String.valueOf(totalEgresados)},
                {"Egresados Empleados", String.valueOf(empleados)},
                {"Tasa de Empleabilidad", String.format("%.1f%%", tasaEmpleabilidad)},
                {"Satisfacción Promedio", String.format("%.1f/5.0", satisfaccionPromedio)},
                {"Período Analizado", periodo != null ? periodo : "Todos los períodos"},
                {"Carrera Filtrada", carrera != null && !carrera.isEmpty() ? carrera : "Todas las carreras"}
            };

            for (String[] row : kpiData) {
                PdfPCell cellKPI = new PdfPCell(new Phrase(row[0], dataFont));
                cellKPI.setPadding(8);
                tablaKPIs.addCell(cellKPI);

                PdfPCell cellValor = new PdfPCell(new Phrase(row[1], dataFont));
                cellValor.setPadding(8);
                tablaKPIs.addCell(cellValor);
            }

            documento.add(tablaKPIs);

            // Resumen adicional
            Paragraph resumen = new Paragraph("Este dashboard presenta un resumen completo de las estadísticas de egresados, " +
                "incluyendo indicadores clave de empleabilidad y satisfacción. Los datos se basan en la información " +
                "más actualizada disponible en el sistema.", 
                new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC, BaseColor.DARK_GRAY));
            resumen.setSpacingBefore(20);
            documento.add(resumen);

            documento.close();

            byte[] bytes = baos.toByteArray();
            response.getOutputStream().write(bytes);
            response.getOutputStream().flush();

        } catch (DocumentException e) {
            throw new IOException("Error al generar el dashboard PDF", e);
        }
    }

    private void exportarDashboardExcel(HttpServletResponse response, String type, String carrera, String periodo) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Dashboard " + type);

        // Obtener datos
        List<EgresadoDTO> egresados = egresadoService.findAllEgresadosFiltered(carrera, null, null, null, null);

        // Título
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Dashboard de Estadísticas - " + type.toUpperCase());
        
        // Estilo para el título
        CellStyle titleStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleCell.setCellStyle(titleStyle);

        // KPIs
        int rowNum = 3;
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("Indicador");
        headerRow.createCell(1).setCellValue("Valor");

        // Calcular KPIs
        long totalEgresados = egresados.size();
        long empleados = egresados.stream().mapToLong(e -> "EMPLEADO".equals(e.getEstadoLaboral()) ? 1 : 0).sum();
        double tasaEmpleabilidad = totalEgresados > 0 ? (empleados * 100.0 / totalEgresados) : 0;
        double satisfaccionPromedio = egresados.stream()
            .filter(e -> e.getSatisfaccionFormacion() != null)
            .mapToDouble(e -> e.getSatisfaccionFormacion())
            .average()
            .orElse(0.0);

        String[][] kpiData = {
            {"Total de Egresados", String.valueOf(totalEgresados)},
            {"Egresados Empleados", String.valueOf(empleados)},
            {"Tasa de Empleabilidad", String.format("%.1f%%", tasaEmpleabilidad)},
            {"Satisfacción Promedio", String.format("%.1f/5.0", satisfaccionPromedio)}
        };

        for (String[] row : kpiData) {
            Row dataRow = sheet.createRow(rowNum++);
            dataRow.createCell(0).setCellValue(row[0]);
            dataRow.createCell(1).setCellValue(row[1]);
        }

        // Ajustar ancho de columnas
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    private void exportarGraficoPDF(HttpServletResponse response, String type, String carrera) throws IOException {
        try {
            Document documento = new Document(PageSize.A4, 36, 36, 54, 36);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(documento, baos);
            documento.open();

            // Título del gráfico
            Font tituloFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, BaseColor.DARK_GRAY);
            Paragraph titulo = new Paragraph("Gráfico: " + type.toUpperCase(), tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(20);
            documento.add(titulo);

            // Obtener datos para el gráfico
            List<EgresadoDTO> egresados = egresadoService.findAllEgresadosFiltered(carrera, null, null, null, null);

            if ("empleabilidad".equals(type)) {
                // Crear tabla de datos de empleabilidad
                PdfPTable tabla = new PdfPTable(3);
                tabla.setWidthPercentage(100);
                
                Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.WHITE);
                
                PdfPCell header1 = new PdfPCell(new Phrase("Carrera", headerFont));
                header1.setBackgroundColor(BaseColor.DARK_GRAY);
                header1.setPadding(10);
                tabla.addCell(header1);

                PdfPCell header2 = new PdfPCell(new Phrase("Empleados", headerFont));
                header2.setBackgroundColor(BaseColor.DARK_GRAY);
                header2.setPadding(10);
                tabla.addCell(header2);

                PdfPCell header3 = new PdfPCell(new Phrase("Tasa Empleabilidad", headerFont));
                header3.setBackgroundColor(BaseColor.DARK_GRAY);
                header3.setPadding(10);
                tabla.addCell(header3);

                // Agrupar por carrera y calcular estadísticas
                egresados.stream()
                    .collect(java.util.stream.Collectors.groupingBy(EgresadoDTO::getCarrera))
                    .forEach((car, lista) -> {
                        long empleados = lista.stream().mapToLong(e -> "EMPLEADO".equals(e.getEstadoLaboral()) ? 1 : 0).sum();
                        double tasa = lista.size() > 0 ? (empleados * 100.0 / lista.size()) : 0;
                        
                        tabla.addCell(new PdfPCell(new Phrase(car != null ? car : "Sin especificar")));
                        tabla.addCell(new PdfPCell(new Phrase(String.valueOf(empleados))));
                        tabla.addCell(new PdfPCell(new Phrase(String.format("%.1f%%", tasa))));
                    });

                documento.add(tabla);
            }

            documento.close();

            byte[] bytes = baos.toByteArray();
            response.getOutputStream().write(bytes);
            response.getOutputStream().flush();

        } catch (DocumentException e) {
            throw new IOException("Error al generar el gráfico PDF", e);
        }
    }

    private void exportarGraficoExcel(HttpServletResponse response, String type, String carrera) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Gráfico " + type);

        // Título
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Datos del Gráfico: " + type.toUpperCase());

        // Obtener datos
        List<EgresadoDTO> egresados = egresadoService.findAllEgresadosFiltered(carrera, null, null, null, null);

        if ("empleabilidad".equals(type)) {
            // Headers
            Row headerRow = sheet.createRow(2);
            headerRow.createCell(0).setCellValue("Carrera");
            headerRow.createCell(1).setCellValue("Total Egresados");
            headerRow.createCell(2).setCellValue("Empleados");
            headerRow.createCell(3).setCellValue("Tasa Empleabilidad (%)");

            int rowNum = 3;
            // Agrupar por carrera y calcular estadísticas
            egresados.stream()
                .collect(java.util.stream.Collectors.groupingBy(EgresadoDTO::getCarrera))
                .forEach((car, lista) -> {
                    long empleados = lista.stream().mapToLong(e -> "EMPLEADO".equals(e.getEstadoLaboral()) ? 1 : 0).sum();
                    double tasa = lista.size() > 0 ? (empleados * 100.0 / lista.size()) : 0;
                    
                    Row dataRow = sheet.createRow(rowNum);
                    dataRow.createCell(0).setCellValue(car != null ? car : "Sin especificar");
                    dataRow.createCell(1).setCellValue(lista.size());
                    dataRow.createCell(2).setCellValue(empleados);
                    dataRow.createCell(3).setCellValue(tasa);
                });
        }

        // Ajustar columnas
        for (int i = 0; i < 4; i++) {
            sheet.autoSizeColumn(i);
        }

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    private void agregarLogo(Document document) throws DocumentException, IOException {
        try {
            // Intenta cargar desde el classpath usando getResourceAsStream (más confiable)
            InputStream logoStream = ReporteService.class.getResourceAsStream("/static/images/logo.png");

            if (logoStream != null) {
                byte[] logoBytes = logoStream.readAllBytes();
                Image logo = Image.getInstance(logoBytes);
                logo.scaleToFit(150, 75);
                logo.setAlignment(Element.ALIGN_CENTER);
                document.add(logo);
                document.add(new Paragraph(" ")); // Espacio después del logo
            } else {
                // Plan alternativo: cargar desde ruta absoluta
                String rutaAbsoluta = "C:/Users/bryn/Desktop/UTPTRACK/frontend/public/logo.png";
                File logoFile = new File(rutaAbsoluta);

                if (logoFile.exists()) {
                    Image logo = Image.getInstance(logoFile.getAbsolutePath());
                    logo.scaleToFit(150, 75);
                    logo.setAlignment(Element.ALIGN_CENTER);
                    document.add(logo);
                    document.add(new Paragraph(" ")); // Espacio después del logo
                } else {
                    System.err.println("No se pudo encontrar el logo en ninguna ubicación");
                }
            }
        } catch (Exception e) {
            System.err.println("Error al cargar el logo: " + e.getMessage());
            // Continúa sin el logo
        }
    }


    private void exportarPDF(HttpServletResponse response, List<EgresadoDTO> egresados) throws IOException {
        try {
            Document documento = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(documento, response.getOutputStream());

            documento.open();

            // Agregar título del documento
            com.itextpdf.text.Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
            Paragraph titulo = new Paragraph("Reporte de Egresados", tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(10);
            documento.add(titulo);

            // Agregar fecha de generación
            com.itextpdf.text.Font fechaFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.DARK_GRAY);
            Paragraph fecha = new Paragraph("Fecha de generación: " + LocalDate.now().toString(), fechaFont);
            fecha.setAlignment(Element.ALIGN_RIGHT);
            fecha.setSpacingAfter(20);
            documento.add(fecha);

            // Crear tabla para los datos
            PdfPTable tabla = new PdfPTable(10);
            tabla.setWidthPercentage(100);
            tabla.setSpacingBefore(10);

            // Definir anchos de columnas
            float[] anchos = {5, 10, 10, 15, 8, 12, 6, 9, 8, 10};
            tabla.setWidths(anchos);

            // Encabezados de la tabla
            com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);

            PdfPCell cellHeader = new PdfPCell();
            cellHeader.setBackgroundColor(new BaseColor(91,54,242));
            cellHeader.setPadding(5);

            String[] encabezados = {"ID", "Nombre", "Apellido", "Email", "DNI", "Carrera", "Año", "Estado", "Sede", "Teléfono"};
            for (String encabezado : encabezados) {
                cellHeader.setPhrase(new Phrase(encabezado, headerFont));
                tabla.addCell(cellHeader);
            }

            // Agregar datos a la tabla
            com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

            for (EgresadoDTO egresado : egresados) {
                tabla.addCell(new Phrase(egresado.getId(), dataFont));
                tabla.addCell(new Phrase(egresado.getNombre(), dataFont));
                tabla.addCell(new Phrase(egresado.getApellido(), dataFont));
                tabla.addCell(new Phrase(egresado.getEmail(), dataFont));
                tabla.addCell(new Phrase(egresado.getDni(), dataFont));
                tabla.addCell(new Phrase(egresado.getCarrera(), dataFont));
                tabla.addCell(new Phrase(egresado.getAnioEgreso() != null ? egresado.getAnioEgreso().toString() : "", dataFont));
                tabla.addCell(new Phrase(egresado.getEstadoLaboral(), dataFont));
                tabla.addCell(new Phrase(egresado.getSede(), dataFont));
                tabla.addCell(new Phrase(egresado.getTelefono(), dataFont));
            }

            documento.add(tabla);

            // Agregar pie de página con información de resumen
            Paragraph resumen = new Paragraph("Total de egresados en el reporte: " + egresados.size(), fechaFont);
            resumen.setSpacingBefore(20);
            documento.add(resumen);

            documento.close();

        } catch (DocumentException e) {
            throw new IOException("Error al generar el documento PDF", e);
        }
    }

    // Método para generar reporte de ubicación/distribución geográfica
    public byte[] generarReporteUbicacion(List<Object[]> datosUbicacion, String formato) throws IOException {
        if (formato.equalsIgnoreCase("excel") || formato.equalsIgnoreCase("xlsx")) {
            return generarReporteUbicacionExcel(datosUbicacion);
        } else {
            return generarReporteUbicacionPDF(datosUbicacion);
        }
    }

    private byte[] generarReporteUbicacionExcel(List<Object[]> datosUbicacion) throws IOException {
        try (Workbook libro = new XSSFWorkbook()) {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            Sheet hoja = libro.createSheet("Distribución Geográfica");

            // Crear estilo para el encabezado
            CellStyle estiloEncabezado = libro.createCellStyle();
            org.apache.poi.ss.usermodel.Font fuenteEncabezado = libro.createFont();
            fuenteEncabezado.setBold(true);
            fuenteEncabezado.setColor(IndexedColors.WHITE.getIndex());
            estiloEncabezado.setFont(fuenteEncabezado);
            estiloEncabezado.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            estiloEncabezado.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Encabezados
            Row filaEncabezado = hoja.createRow(0);
            Cell celdaSede = filaEncabezado.createCell(0);
            celdaSede.setCellValue("Sede");
            celdaSede.setCellStyle(estiloEncabezado);

            Cell celdaCantidad = filaEncabezado.createCell(1);
            celdaCantidad.setCellValue("Cantidad de Egresados");
            celdaCantidad.setCellStyle(estiloEncabezado);

            // Datos
            int filaIndex = 1;
            for (Object[] fila : datosUbicacion) {
                Row filaDatos = hoja.createRow(filaIndex++);
                filaDatos.createCell(0).setCellValue(fila[0] != null ? fila[0].toString() : "Sin sede");
                filaDatos.createCell(1).setCellValue(fila[1] != null ? ((Number) fila[1]).doubleValue() : 0);
            }

            // Ajustar ancho de columnas
            hoja.autoSizeColumn(0);
            hoja.autoSizeColumn(1);

            libro.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private byte[] generarReporteUbicacionPDF(List<Object[]> datosUbicacion) throws IOException {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Document documento = new Document(PageSize.A4);
            PdfWriter.getInstance(documento, outputStream);

            documento.open();

            // Título
            com.itextpdf.text.Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
            Paragraph titulo = new Paragraph("Reporte de Distribución Geográfica", tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(20);
            documento.add(titulo);

            // Fecha de generación
            com.itextpdf.text.Font fechaFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.DARK_GRAY);
            Paragraph fecha = new Paragraph("Fecha de generación: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), fechaFont);
            fecha.setAlignment(Element.ALIGN_RIGHT);
            fecha.setSpacingAfter(20);
            documento.add(fecha);

            // Tabla
            PdfPTable tabla = new PdfPTable(2);
            tabla.setWidthPercentage(60);
            tabla.setHorizontalAlignment(Element.ALIGN_CENTER);

            // Encabezados
            com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE);
            PdfPCell cellHeader = new PdfPCell();
            cellHeader.setBackgroundColor(new BaseColor(91, 54, 242));
            cellHeader.setPadding(8);
            cellHeader.setHorizontalAlignment(Element.ALIGN_CENTER);

            cellHeader.setPhrase(new Phrase("Sede", headerFont));
            tabla.addCell(cellHeader);

            cellHeader.setPhrase(new Phrase("Cantidad de Egresados", headerFont));
            tabla.addCell(cellHeader);

            // Datos
            com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
            for (Object[] fila : datosUbicacion) {
                PdfPCell celdaSede = new PdfPCell(new Phrase(
                    fila[0] != null ? fila[0].toString() : "Sin sede", dataFont));
                celdaSede.setPadding(6);
                celdaSede.setHorizontalAlignment(Element.ALIGN_LEFT);
                tabla.addCell(celdaSede);

                PdfPCell celdaCantidad = new PdfPCell(new Phrase(
                    fila[1] != null ? fila[1].toString() : "0", dataFont));
                celdaCantidad.setPadding(6);
                celdaCantidad.setHorizontalAlignment(Element.ALIGN_CENTER);
                tabla.addCell(celdaCantidad);
            }

            documento.add(tabla);

            // Resumen
            int totalEgresados = datosUbicacion.stream()
                .mapToInt(fila -> fila[1] != null ? ((Number) fila[1]).intValue() : 0)
                .sum();

            Paragraph resumen = new Paragraph("Total de egresados: " + totalEgresados, fechaFont);
            resumen.setSpacingBefore(20);
            resumen.setAlignment(Element.ALIGN_CENTER);
            documento.add(resumen);

            documento.close();
            return outputStream.toByteArray();

        } catch (DocumentException e) {
            throw new IOException("Error al generar el documento PDF", e);
        }
    }

    public List<Map<String, Object>> obtenerExperienciasLaboralesFiltradas(
            String carrera,
            String estado,
            String sede,
            String fechaInicio,
            String fechaFin,
            String search
    ) {
        java.util.Date fechaInicioDate = null;
        java.util.Date fechaFinDate = null;
        try {
            if (fechaInicio != null && !fechaInicio.isEmpty()) {
                fechaInicioDate = java.sql.Date.valueOf(fechaInicio);
            }
            if (fechaFin != null && !fechaFin.isEmpty()) {
                fechaFinDate = java.sql.Date.valueOf(fechaFin);
            }
        } catch (Exception e) {
            // Si hay error en el parseo, dejar fechas en null
        }
        List<ExperienciaLaboral> experiencias = experienciaLaboralRepository.findByFiltersForReport(
                (carrera != null && !carrera.equals("all")) ? carrera : null,
                (estado != null && !estado.equals("all")) ? estado : null,
                (sede != null && !sede.equals("all")) ? sede : null,
                fechaInicioDate,
                fechaFinDate,
                (search != null && !search.isEmpty()) ? search : null
        );
        List<Map<String, Object>> resultado = new java.util.ArrayList<>();
        for (ExperienciaLaboral exp : experiencias) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", exp.getId());
            map.put("empresa", exp.getEmpresa());
            map.put("puesto", exp.getPuesto());
            map.put("fechaInicio", exp.getFechaInicio());
            map.put("fechaFin", exp.getFechaFin());
            map.put("salario", exp.getSalario());
            map.put("descripcion", exp.getDescripcion());
            Egresado eg = exp.getEgresado();
            if (eg != null) {
                map.put("egresadoId", eg.getId());
                map.put("nombre", eg.getNombre());
                map.put("apellido", eg.getApellido());
                map.put("carrera", eg.getCarrera());
                map.put("sede", eg.getSede());
                map.put("anoGraduacion", eg.getAnoGraduacion());
                map.put("estadoLaboral", eg.getEstadoLaboral());
                map.put("correo", eg.getCorreo());
            }
            resultado.add(map);
        }
        return resultado;
    }

    public List<Map<String, Object>> obtenerExperienciasLaboralesAgrupadasPorEgresado(
            String carrera,
            String estado,
            String sede,
            String fechaInicio,
            String fechaFin,
            String search
    ) {
        java.util.Date fechaInicioDate = null;
        java.util.Date fechaFinDate = null;
        try {
            if (fechaInicio != null && !fechaInicio.isEmpty()) {
                fechaInicioDate = java.sql.Date.valueOf(fechaInicio);
            }
            if (fechaFin != null && !fechaFin.isEmpty()) {
                fechaFinDate = java.sql.Date.valueOf(fechaFin);
            }
        } catch (Exception e) {
            // Si hay error en el parseo, dejar fechas en null
        }
        List<ExperienciaLaboral> experiencias = experienciaLaboralRepository.findByFiltersForReport(
                (carrera != null && !carrera.equals("all")) ? carrera : null,
                (estado != null && !estado.equals("all")) ? estado : null,
                (sede != null && !sede.equals("all")) ? sede : null,
                fechaInicioDate,
                fechaFinDate,
                (search != null && !search.isEmpty()) ? search : null
        );
        // Agrupar por egresadoId
        Map<String, Map<String, Object>> agrupado = new java.util.LinkedHashMap<>();
        for (ExperienciaLaboral exp : experiencias) {
            Egresado eg = exp.getEgresado();
            if (eg == null) continue;
            String egresadoId = eg.getId();
            if (!agrupado.containsKey(egresadoId)) {
                Map<String, Object> egresadoMap = new HashMap<>();
                Map<String, Object> egresadoInfo = new HashMap<>();
                egresadoInfo.put("id", eg.getId());
                egresadoInfo.put("nombre", eg.getNombre());
                egresadoInfo.put("apellido", eg.getApellido());
                egresadoInfo.put("carrera", eg.getCarrera());
                egresadoInfo.put("correo", eg.getCorreo());
                egresadoInfo.put("sede", eg.getSede());
                egresadoInfo.put("anoGraduacion", eg.getAnoGraduacion());
                egresadoInfo.put("estadoLaboral", eg.getEstadoLaboral());
                egresadoMap.put("egresado", egresadoInfo);
                egresadoMap.put("experiencias", new java.util.ArrayList<Map<String, Object>>());
                agrupado.put(egresadoId, egresadoMap);
            }
            Map<String, Object> expMap = new HashMap<>();
            expMap.put("id", exp.getId());
            expMap.put("empresa", exp.getEmpresa());
            expMap.put("puesto", exp.getPuesto());
            expMap.put("fechaInicio", exp.getFechaInicio());
            expMap.put("fechaFin", exp.getFechaFin());
            expMap.put("salario", exp.getSalario());
            expMap.put("descripcion", exp.getDescripcion());
            ((List<Map<String, Object>>) agrupado.get(egresadoId).get("experiencias")).add(expMap);
        }
        return new java.util.ArrayList<>(agrupado.values());
    }

    public byte[] exportarExperienciasLaboralesAgrupadasExcel(List<Map<String, Object>> agrupado) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Experiencias Laborales");
            // Cabeceras
            String[] headers = {"Nombre Completo", "Carrera", "Correo", "Sede", "Año Graduación", "Estado Laboral", "Experiencias Laborales"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }
            // Llenar datos
            int rowNum = 1;
            for (Map<String, Object> item : agrupado) {
                Map<String, Object> egresado = (Map<String, Object>) item.get("egresado");
                List<Map<String, Object>> experiencias = (List<Map<String, Object>>) item.get("experiencias");
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue((egresado.get("nombre") != null ? egresado.get("nombre") : "") + " " + (egresado.get("apellido") != null ? egresado.get("apellido") : ""));
                row.createCell(1).setCellValue(egresado.get("carrera") != null ? egresado.get("carrera").toString() : "");
                row.createCell(2).setCellValue(egresado.get("correo") != null ? egresado.get("correo").toString() : "");
                row.createCell(3).setCellValue(egresado.get("sede") != null ? egresado.get("sede").toString() : "");
                row.createCell(4).setCellValue(egresado.get("anoGraduacion") != null ? egresado.get("anoGraduacion").toString() : "");
                row.createCell(5).setCellValue(egresado.get("estadoLaboral") != null ? egresado.get("estadoLaboral").toString() : "");
                // Experiencias laborales concatenadas
                StringBuilder expStr = new StringBuilder();
                for (Map<String, Object> exp : experiencias) {
                    expStr.append(
                        (exp.get("empresa") != null ? exp.get("empresa") : "") + " - " +
                        (exp.get("puesto") != null ? exp.get("puesto") : "") +
                        " (" +
                        (exp.get("fechaInicio") != null ? exp.get("fechaInicio").toString() : "") +
                        " a " +
                        (exp.get("fechaFin") != null ? exp.get("fechaFin").toString() : "Presente") +
                        (exp.get("salario") != null ? ", S/ " + exp.get("salario") : "") +
                        ")"
                    );
                    expStr.append("; ");
                }
                row.createCell(6).setCellValue(expStr.toString().trim());
            }
            // Auto-ajustar ancho de columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    public byte[] exportarExperienciasLaboralesAgrupadasPDF(List<Map<String, Object>> agrupado) throws IOException {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, baos);
            document.open();
            // Título
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph title = new Paragraph("Reporte de Experiencias Laborales Agrupadas", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);
            // Por cada egresado
            Font egresadoFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font expFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            for (Map<String, Object> item : agrupado) {
                Map<String, Object> egresado = (Map<String, Object>) item.get("egresado");
                List<Map<String, Object>> experiencias = (List<Map<String, Object>>) item.get("experiencias");
                Paragraph egresadoInfo = new Paragraph(
                    (egresado.get("nombre") != null ? egresado.get("nombre") : "") + " " +
                    (egresado.get("apellido") != null ? egresado.get("apellido") : "") +
                    " | Carrera: " + (egresado.get("carrera") != null ? egresado.get("carrera") : "") +
                    " | Correo: " + (egresado.get("correo") != null ? egresado.get("correo") : "") +
                    " | Sede: " + (egresado.get("sede") != null ? egresado.get("sede") : "") +
                    " | Año Graduación: " + (egresado.get("anoGraduacion") != null ? egresado.get("anoGraduacion") : "") +
                    " | Estado Laboral: " + (egresado.get("estadoLaboral") != null ? egresado.get("estadoLaboral") : ""),
                    egresadoFont
                );
                egresadoInfo.setSpacingBefore(10);
                egresadoInfo.setSpacingAfter(5);
                document.add(egresadoInfo);
                // Tabla de experiencias
                PdfPTable tabla = new PdfPTable(5);
                tabla.setWidthPercentage(100);
                tabla.setSpacingBefore(5);
                tabla.setSpacingAfter(10);
                tabla.addCell(new Phrase("Empresa", egresadoFont));
                tabla.addCell(new Phrase("Puesto", egresadoFont));
                tabla.addCell(new Phrase("Fecha Inicio", egresadoFont));
                tabla.addCell(new Phrase("Fecha Fin", egresadoFont));
                tabla.addCell(new Phrase("Salario", egresadoFont));
                for (Map<String, Object> exp : experiencias) {
                    tabla.addCell(new Phrase(exp.get("empresa") != null ? exp.get("empresa").toString() : "", expFont));
                    tabla.addCell(new Phrase(exp.get("puesto") != null ? exp.get("puesto").toString() : "", expFont));
                    tabla.addCell(new Phrase(exp.get("fechaInicio") != null ? exp.get("fechaInicio").toString() : "", expFont));
                    tabla.addCell(new Phrase(exp.get("fechaFin") != null ? exp.get("fechaFin").toString() : "Presente", expFont));
                    tabla.addCell(new Phrase(exp.get("salario") != null ? ("S/ " + exp.get("salario")) : "", expFont));
                }
                document.add(tabla);
            }
            document.close();
            return baos.toByteArray();
        } catch (DocumentException e) {
            throw new IOException("Error al generar el PDF de experiencias laborales agrupadas", e);
        }
    }
}