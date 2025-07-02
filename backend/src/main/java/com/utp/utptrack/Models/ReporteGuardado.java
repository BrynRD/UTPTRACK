package com.utp.utptrack.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reportes_guardados")
public class ReporteGuardado {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private String tipoReporte;

    @Column(columnDefinition = "TEXT")
    private String parametros; // JSON o texto plano de los filtros usados

    private LocalDateTime fechaGeneracion;

    private String urlArchivo; // Opcional: ruta o URL del archivo generado

    private String estado; // "reciente" o "programado"

    @PrePersist
    protected void onCreate() {
        fechaGeneracion = LocalDateTime.now();
    }

    // Getters y setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getTipoReporte() { return tipoReporte; }
    public void setTipoReporte(String tipoReporte) { this.tipoReporte = tipoReporte; }

    public String getParametros() { return parametros; }
    public void setParametros(String parametros) { this.parametros = parametros; }

    public LocalDateTime getFechaGeneracion() { return fechaGeneracion; }
    public void setFechaGeneracion(LocalDateTime fechaGeneracion) { this.fechaGeneracion = fechaGeneracion; }

    public String getUrlArchivo() { return urlArchivo; }
    public void setUrlArchivo(String urlArchivo) { this.urlArchivo = urlArchivo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
} 