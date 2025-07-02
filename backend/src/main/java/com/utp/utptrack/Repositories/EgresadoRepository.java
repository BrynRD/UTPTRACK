package com.utp.utptrack.Repositories;

import com.utp.utptrack.Models.Egresado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EgresadoRepository extends JpaRepository<Egresado, String> {

    // Consultas existentes para paginación y filtrado
    @Query("SELECT e FROM Egresado e WHERE " +
            "(:carrera IS NULL OR :carrera = 'all' OR e.carrera = :carrera) AND " +
            "(:yearInicio IS NULL OR e.anoGraduacion >= :yearInicio) AND " +
            "(:yearFin IS NULL OR e.anoGraduacion <= :yearFin) AND " +
            "(:estado IS NULL OR :estado = 'all' OR e.estadoLaboral = :estado) AND " +
            "(:sede IS NULL OR :sede = 'all' OR e.sede = :sede)")
    Page<Egresado> findByFilters(
            @Param("carrera") String carrera,
            @Param("yearInicio") Integer yearInicio,
            @Param("yearFin") Integer yearFin,
            @Param("estado") String estado,
            @Param("sede") String sede,
            Pageable pageable);

    @Query("SELECT e FROM Egresado e WHERE " +
            "(:carrera IS NULL OR :carrera = 'all' OR e.carrera = :carrera) AND " +
            "(:yearInicio IS NULL OR e.anoGraduacion >= :yearInicio) AND " +
            "(:yearFin IS NULL OR e.anoGraduacion <= :yearFin) AND " +
            "(:estado IS NULL OR :estado = 'all' OR e.estadoLaboral = :estado) AND " +
            "(:sede IS NULL OR :sede = 'all' OR e.sede = :sede)")
    List<Egresado> findAllByFilters(
            @Param("carrera") String carrera,
            @Param("yearInicio") Integer yearInicio,
            @Param("yearFin") Integer yearFin,
            @Param("estado") String estado,
            @Param("sede") String sede);

    // Consulta con parámetros de fecha para filtrar por género
    @Query("SELECT e.genero, COUNT(e) FROM Egresado e WHERE " +
            "(:carrera IS NULL OR :carrera = '' OR e.carrera = :carrera) AND " +
            "(:yearInicio IS NULL OR e.anoGraduacion >= :yearInicio) AND " +
            "(:yearFin IS NULL OR e.anoGraduacion <= :yearFin) " +
            "GROUP BY e.genero")
    List<Object[]> countByGenero(
            @Param("carrera") String carrera,
            @Param("yearInicio") Integer yearInicio,
            @Param("yearFin") Integer yearFin);

    // Consulta con parámetros de fecha para empleabilidad por carrera
    @Query("SELECT e.carrera, " +
            "SUM(CASE WHEN e.estadoLaboral = 'EMPLEADO' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN e.estadoLaboral = 'DESEMPLEADO' THEN 1 ELSE 0 END) " +
            "FROM Egresado e WHERE " +
            "(:carrera IS NULL OR :carrera = '' OR e.carrera = :carrera) AND " +
            "(:yearInicio IS NULL OR e.anoGraduacion >= :yearInicio) AND " +
            "(:yearFin IS NULL OR e.anoGraduacion <= :yearFin) " +
            "GROUP BY e.carrera")
    List<Object[]> countEmpleabilidadPorCarrera(
            @Param("carrera") String carrera,
            @Param("yearInicio") Integer yearInicio,
            @Param("yearFin") Integer yearFin);

    // Consulta con parámetros de fecha para satisfacción por carrera
    @Query("SELECT e.carrera, AVG(e.satisfaccionFormacion) FROM Egresado e WHERE " +
            "e.satisfaccionFormacion IS NOT NULL AND " +
            "(:yearInicio IS NULL OR e.anoGraduacion >= :yearInicio) AND " +
            "(:yearFin IS NULL OR e.anoGraduacion <= :yearFin) " +
            "GROUP BY e.carrera")
    List<Object[]> averageSatisfaccionByCarreraAgrupado(
            @Param("yearInicio") Integer yearInicio,
            @Param("yearFin") Integer yearFin);

    // Consulta con parámetros de fecha para conteo por sedes
    @Query("SELECT e.sede, COUNT(e) FROM Egresado e WHERE " +
            "(:carrera IS NULL OR :carrera = '' OR e.carrera = :carrera) AND " +
            "(:yearInicio IS NULL OR e.anoGraduacion >= :yearInicio) AND " +
            "(:yearFin IS NULL OR e.anoGraduacion <= :yearFin) " +
            "GROUP BY e.sede")
    List<Object[]> countBySede(
            @Param("carrera") String carrera,
            @Param("yearInicio") Integer yearInicio,
            @Param("yearFin") Integer yearFin);

    // Consultas con parámetros de fecha para estadísticas generales
    @Query("SELECT COUNT(e) FROM Egresado e WHERE " +
            "(:carrera IS NULL OR :carrera = '' OR e.carrera = :carrera) AND " +
            "(:yearInicio IS NULL OR e.anoGraduacion >= :yearInicio) AND " +
            "(:yearFin IS NULL OR e.anoGraduacion <= :yearFin) AND " +
            "e.estadoLaboral = 'EMPLEADO'")
    Long countEmpleadosByParameters(
            @Param("carrera") String carrera,
            @Param("yearInicio") Integer yearInicio,
            @Param("yearFin") Integer yearFin);

    @Query("SELECT COUNT(e) FROM Egresado e WHERE " +
            "(:carrera IS NULL OR :carrera = '' OR e.carrera = :carrera) AND " +
            "(:yearInicio IS NULL OR e.anoGraduacion >= :yearInicio) AND " +
            "(:yearFin IS NULL OR e.anoGraduacion <= :yearFin) AND " +
            "e.estadoLaboral = 'DESEMPLEADO'")
    Long countDesempleadosByParameters(
            @Param("carrera") String carrera,
            @Param("yearInicio") Integer yearInicio,
            @Param("yearFin") Integer yearFin);

    @Query("SELECT AVG(e.satisfaccionFormacion) FROM Egresado e WHERE " +
            "(:carrera IS NULL OR :carrera = '' OR e.carrera = :carrera) AND " +
            "(:yearInicio IS NULL OR e.anoGraduacion >= :yearInicio) AND " +
            "(:yearFin IS NULL OR e.anoGraduacion <= :yearFin) AND " +
            "e.satisfaccionFormacion IS NOT NULL")
    Double averageSatisfaccionByCarrera(
            @Param("carrera") String carrera,
            @Param("yearInicio") Integer yearInicio,
            @Param("yearFin") Integer yearFin);

    // Métodos de utilidad mantenidos para compatibilidad
    @Query("SELECT COUNT(e) FROM Egresado e WHERE e.estadoLaboral = 'EMPLEADO' " +
            "AND (:carrera IS NULL OR :carrera = 'all' OR e.carrera = :carrera)")
    Long countEmpleadosByCarrera(@Param("carrera") String carrera);

    @Query("SELECT e.carrera, COUNT(e) FROM Egresado e WHERE e.estadoLaboral = 'EMPLEADO' " +
            "GROUP BY e.carrera")
    List<Object[]> countEmpleadosByCarreraAgrupado();

    // Método para obtener salarios promedio por carrera con valores simulados
    // Ya que no hay campo de salario actual, usamos un CASE con valores aproximados
    @Query(value = "SELECT e.carrera AS name, " +
            "CASE " +
            "  WHEN e.carrera = 'Ing. Sistemas' THEN 4500.0 " +
            "  WHEN e.carrera = 'Ing. Industrial' THEN 4200.0 " +
            "  WHEN e.carrera = 'Ing. Civil' THEN 4800.0 " +
            "  WHEN e.carrera = 'Administración' THEN 3800.0 " +
            "  WHEN e.carrera = 'Contabilidad' THEN 3500.0 " +
            "  WHEN e.carrera = 'Marketing' THEN 3200.0 " +
            "  ELSE 3000.0 " +
            "END " +
            "FROM Egresado e " +
            "WHERE (:carrera IS NULL OR :carrera = '' OR e.carrera = :carrera) " +
            "AND (:yearInicio IS NULL OR e.anoGraduacion >= :yearInicio) " +
            "AND (:yearFin IS NULL OR e.anoGraduacion <= :yearFin) " +
            "GROUP BY e.carrera " +
            "ORDER BY " +
            "CASE " +
            "  WHEN e.carrera = 'Ing. Sistemas' THEN 4500.0 " +
            "  WHEN e.carrera = 'Ing. Industrial' THEN 4200.0 " +
            "  WHEN e.carrera = 'Ing. Civil' THEN 4800.0 " +
            "  WHEN e.carrera = 'Administración' THEN 3800.0 " +
            "  WHEN e.carrera = 'Contabilidad' THEN 3500.0 " +
            "  WHEN e.carrera = 'Marketing' THEN 3200.0 " +
            "  ELSE 3000.0 " +
            "END DESC",
            nativeQuery = false)
    List<Object[]> getSalariosPorCarrera(
            @Param("carrera") String carrera,
            @Param("yearInicio") Integer yearInicio,
            @Param("yearFin") Integer yearFin);

    @Query("SELECT e.carrera, AVG(ex.salario) FROM Egresado e JOIN e.experienciasLaborales ex WHERE (:carrera IS NULL OR :carrera = '' OR e.carrera = :carrera) GROUP BY e.carrera")
    List<Object[]> getSalarioPromedioRealPorCarrera(@Param("carrera") String carrera);

    @Query("SELECT e.carrera, AVG(ex.salario) FROM Egresado e JOIN e.experienciasLaborales ex WHERE (\n" +
            "(:carrera IS NULL OR :carrera = '' OR e.carrera = :carrera) AND " +
            "(:yearInicio IS NULL OR e.anoGraduacion >= :yearInicio) AND " +
            "(:yearFin IS NULL OR e.anoGraduacion <= :yearFin) AND " +
            "(:estado IS NULL OR :estado = 'all' OR e.estadoLaboral = :estado) AND " +
            "(:sede IS NULL OR :sede = 'all' OR e.sede = :sede)) " +
            "GROUP BY e.carrera")
    List<Object[]> getSalarioPromedioRealPorCarreraFull(
            @Param("carrera") String carrera,
            @Param("yearInicio") Integer yearInicio,
            @Param("yearFin") Integer yearFin,
            @Param("estado") String estado,
            @Param("sede") String sede);

    @Query("SELECT e.carrera, AVG(e.satisfaccionFormacion) FROM Egresado e WHERE " +
            "e.satisfaccionFormacion IS NOT NULL AND " +
            "(:carrera IS NULL OR :carrera = '' OR e.carrera = :carrera) AND " +
            "(:yearInicio IS NULL OR e.anoGraduacion >= :yearInicio) AND " +
            "(:yearFin IS NULL OR e.anoGraduacion <= :yearFin) AND " +
            "(:estado IS NULL OR :estado = 'all' OR e.estadoLaboral = :estado) AND " +
            "(:sede IS NULL OR :sede = 'all' OR e.sede = :sede) " +
            "GROUP BY e.carrera")
    List<Object[]> averageSatisfaccionByCarreraAgrupadoFiltro(
            @Param("carrera") String carrera,
            @Param("yearInicio") Integer yearInicio,
            @Param("yearFin") Integer yearFin,
            @Param("estado") String estado,
            @Param("sede") String sede);
}