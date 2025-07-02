package com.utp.utptrack.Services;

import com.utp.utptrack.Models.ReporteGuardado;
import com.utp.utptrack.Models.Usuario;
import com.utp.utptrack.Repositories.ReporteGuardadoRepository;
import com.utp.utptrack.Repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReporteGuardadoService {
    @Autowired
    private ReporteGuardadoRepository reporteGuardadoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    public ReporteGuardado guardarReporte(String usuarioId, String tipoReporte, String parametros, String urlArchivo, String estado) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
        if (usuarioOpt.isEmpty()) throw new RuntimeException("Usuario no encontrado");
        ReporteGuardado reporte = new ReporteGuardado();
        reporte.setUsuario(usuarioOpt.get());
        reporte.setTipoReporte(tipoReporte);
        reporte.setParametros(parametros);
        reporte.setUrlArchivo(urlArchivo);
        reporte.setEstado(estado);
        return reporteGuardadoRepository.save(reporte);
    }

    public List<ReporteGuardado> listarPorUsuario(String usuarioId) {
        return reporteGuardadoRepository.findByUsuarioId(usuarioId);
    }

    public Optional<ReporteGuardado> buscarPorId(String id) {
        return reporteGuardadoRepository.findById(id);
    }

    public boolean eliminarReporte(String id) {
        if (reporteGuardadoRepository.existsById(id)) {
            reporteGuardadoRepository.deleteById(id);
            return true;
        }
        return false;
    }
} 