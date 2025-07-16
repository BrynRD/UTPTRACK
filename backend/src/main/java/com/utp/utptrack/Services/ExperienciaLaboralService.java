package com.utp.utptrack.Services;

import com.utp.utptrack.Models.ExperienciaLaboral;
import com.utp.utptrack.Models.Egresado;
import com.utp.utptrack.Repositories.ExperienciaLaboralRepository;
import com.utp.utptrack.Repositories.EgresadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ExperienciaLaboralService {

    @Autowired
    private ExperienciaLaboralRepository experienciaLaboralRepository;

    @Autowired
    private EgresadoRepository egresadoRepository;

    public List<ExperienciaLaboral> findByEgresadoId(String egresadoId) {
        return experienciaLaboralRepository.findByEgresadoIdOrderByFechaInicioDesc(egresadoId);
    }

    public ExperienciaLaboral save(ExperienciaLaboral experienciaLaboral) {
        if (experienciaLaboral.getId() == null) {
            experienciaLaboral.setId(UUID.randomUUID().toString());
        }
        return experienciaLaboralRepository.save(experienciaLaboral);
    }

    public Optional<ExperienciaLaboral> findById(String id) {
        return experienciaLaboralRepository.findById(id);
    }

    public ExperienciaLaboral update(String id, ExperienciaLaboral experienciaLaboral) {
        Optional<ExperienciaLaboral> existing = experienciaLaboralRepository.findById(id);
        if (existing.isPresent()) {
            ExperienciaLaboral updated = existing.get();
            updated.setEmpresa(experienciaLaboral.getEmpresa());
            updated.setPuesto(experienciaLaboral.getPuesto());
            updated.setFechaInicio(experienciaLaboral.getFechaInicio());
            updated.setFechaFin(experienciaLaboral.getFechaFin());
            updated.setSalario(experienciaLaboral.getSalario());
            updated.setDescripcion(experienciaLaboral.getDescripcion());
            return experienciaLaboralRepository.save(updated);
        }
        throw new RuntimeException("Experiencia laboral no encontrada");
    }

    public void delete(String id) {
        experienciaLaboralRepository.deleteById(id);
    }

    public List<ExperienciaLaboral> findCurrentExperiencesByEgresadoId(String egresadoId) {
        return experienciaLaboralRepository.findCurrentExperiencesByEgresadoId(egresadoId);
    }

    public List<ExperienciaLaboral> findPastExperiencesByEgresadoId(String egresadoId) {
        return experienciaLaboralRepository.findPastExperiencesByEgresadoId(egresadoId);
    }
} 