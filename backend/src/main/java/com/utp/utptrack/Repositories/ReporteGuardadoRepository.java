package com.utp.utptrack.Repositories;

import com.utp.utptrack.Models.ReporteGuardado;
import com.utp.utptrack.Models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReporteGuardadoRepository extends JpaRepository<ReporteGuardado, String> {
    List<ReporteGuardado> findByUsuarioId(String usuarioId);
} 