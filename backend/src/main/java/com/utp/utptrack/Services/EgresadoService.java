package com.utp.utptrack.Services;

import com.utp.utptrack.dto.EgresadoDTO;
import com.utp.utptrack.Models.Egresado;
import com.utp.utptrack.Repositories.EgresadoRepository;
import com.utp.utptrack.dto.EgresadoUsuarioDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EgresadoService {

    private final EgresadoRepository egresadoRepository;

    public EgresadoService(EgresadoRepository egresadoRepository) {
        this.egresadoRepository = egresadoRepository;
    }

    // Métodos CRUD básicos
    public List<Egresado> obtenerTodos() {
        return egresadoRepository.findAll();
    }

    public Egresado buscarPorId(String id) {
        return egresadoRepository.findById(id).orElse(null);
    }

    public Egresado guardar(Egresado egresado) {
        return egresadoRepository.save(egresado);
    }

    public Egresado actualizarEgresado(String id, Egresado egresadoActualizado) {
        Optional<Egresado> egresadoExistente = egresadoRepository.findById(id);

        if (egresadoExistente.isPresent()) {
            Egresado egresado = egresadoExistente.get();
            // Actualizar los campos
            egresado.setNombre(egresadoActualizado.getNombre());
            egresado.setApellidos(egresadoActualizado.getApellidos());
            egresado.setEmail(egresadoActualizado.getEmail());
            egresado.setDni(egresadoActualizado.getDni());
            egresado.setCarrera(egresadoActualizado.getCarrera());
            egresado.setAnoGraduacion(egresadoActualizado.getAnoGraduacion());
            egresado.setEstadoLaboral(egresadoActualizado.getEstadoLaboral());
            egresado.setSede(egresadoActualizado.getSede());
            egresado.setTelefono(egresadoActualizado.getTelefono());
            egresado.setGenero(egresadoActualizado.getGenero());
            egresado.setSatisfaccionFormacion(egresadoActualizado.getSatisfaccionFormacion());
            egresado.setEmpresaActual(egresadoActualizado.getEmpresaActual());

            return egresadoRepository.save(egresado);
        }

        return null;
    }

    public void eliminar(String id) {
        egresadoRepository.deleteById(id);
    }

    // Métodos para la funcionalidad de reportes
    public Page<EgresadoDTO> findEgresadosFiltered(
            String carrera,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String estado,
            String sede,
            int page,
            int size) {

        try {
            // Extraer el año de las fechas si no son nulas
            Integer yearInicio = fechaInicio != null ? fechaInicio.getYear() : null;
            Integer yearFin = fechaFin != null ? fechaFin.getYear() : null;

            Pageable pageable = PageRequest.of(page, size);
            Page<Egresado> egresadosPage = egresadoRepository.findByFilters(
                    carrera, yearInicio, yearFin, estado, sede, pageable);

            return egresadosPage.map(this::convertToDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return Page.empty(PageRequest.of(page, size));
        }
    }

    public List<EgresadoDTO> findAllEgresadosFiltered(
            String carrera,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String estado,
            String sede) {

        try {
            // Extraer el año de las fechas si no son nulas
            Integer yearInicio = fechaInicio != null ? fechaInicio.getYear() : null;
            Integer yearFin = fechaFin != null ? fechaFin.getYear() : null;

            List<Egresado> egresados = egresadoRepository.findAllByFilters(
                    carrera, yearInicio, yearFin, estado, sede);

            return egresados.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    // Método para convertir de Egresado a EgresadoDTO
    private EgresadoDTO convertToDTO(Egresado egresado) {
        EgresadoDTO dto = new EgresadoDTO();
        dto.setId(egresado.getId());
        dto.setNombre(egresado.getNombre());
        dto.setApellido(egresado.getApellidos());
        dto.setEmail(egresado.getEmail());
        dto.setDni(egresado.getDni());
        dto.setCarrera(egresado.getCarrera());
        dto.setAnioEgreso(egresado.getAnoGraduacion());
        dto.setEstadoLaboral(egresado.getEstadoLaboral());
        dto.setSede(egresado.getSede());
        dto.setTelefono(egresado.getTelefono());
        dto.setGenero(egresado.getGenero());

        // Convertir Integer a Double para satisfaccionFormacion
        if (egresado.getSatisfaccionFormacion() != null) {
            dto.setSatisfaccionFormacion(egresado.getSatisfaccionFormacion().doubleValue());
        }

        dto.setEmpresaActual(egresado.getEmpresaActual());
        return dto;
    }

    // Método para convertir de EgresadoUsuarioDTO a EgresadoDTO
    public EgresadoDTO convertFromUsuarioDTO(EgresadoUsuarioDTO usuarioDTO) {
        EgresadoDTO dto = new EgresadoDTO();
        dto.setId(usuarioDTO.getId());
        dto.setNombre(usuarioDTO.getNombre());
        dto.setEmail(usuarioDTO.getEmail());
        dto.setCarrera(usuarioDTO.getCarrera());
        dto.setAnioEgreso(usuarioDTO.getAnoGraduacion());
        dto.setEstadoLaboral(usuarioDTO.getEstadoLaboral());
        return dto;
    }
}