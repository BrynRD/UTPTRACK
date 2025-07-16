package com.utp.utptrack.Repositories;

import com.utp.utptrack.Models.ExperienciaLaboral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienciaLaboralRepository extends JpaRepository<ExperienciaLaboral, String> {
    
    @Query("SELECT e FROM ExperienciaLaboral e WHERE e.egresado.id = :egresadoId ORDER BY e.fechaInicio DESC")
    List<ExperienciaLaboral> findByEgresadoIdOrderByFechaInicioDesc(@Param("egresadoId") String egresadoId);
    
    @Query("SELECT e FROM ExperienciaLaboral e WHERE e.egresado.id = :egresadoId AND e.fechaFin IS NULL")
    List<ExperienciaLaboral> findCurrentExperiencesByEgresadoId(@Param("egresadoId") String egresadoId);
    
    @Query("SELECT e FROM ExperienciaLaboral e WHERE e.egresado.id = :egresadoId AND e.fechaFin IS NOT NULL")
    List<ExperienciaLaboral> findPastExperiencesByEgresadoId(@Param("egresadoId") String egresadoId);

    @Query("""
        SELECT e FROM ExperienciaLaboral e
        JOIN e.egresado eg
        WHERE (:carrera IS NULL OR TRIM(LOWER(COALESCE(eg.carrera, ''))) = TRIM(LOWER(COALESCE(:carrera, ''))))
        AND (:estado IS NULL OR eg.estadoLaboral = :estado)
        AND (:sede IS NULL OR eg.sede = :sede)
        AND (:fechaInicio IS NULL OR e.fechaInicio >= :fechaInicio)
        AND (:fechaFin IS NULL OR e.fechaFin <= :fechaFin)
        AND (
            :search IS NULL OR :search = '' OR
            LOWER(eg.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(eg.apellido) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(eg.correo) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        ORDER BY e.fechaInicio DESC
    """)
    List<ExperienciaLaboral> findByFiltersForReport(
        @Param("carrera") String carrera,
        @Param("estado") String estado,
        @Param("sede") String sede,
        @Param("fechaInicio") java.util.Date fechaInicio,
        @Param("fechaFin") java.util.Date fechaFin,
        @Param("search") String search
    );
} 