package com.utp.utptrack.dto;

public class EgresadoUsuarioDTO {
    private String id;
    private String usuarioId; // Nuevo campo para el ID del usuario
    private String nombre;
    private String codigoEstudiante;
    private String carrera;
    private Integer anoGraduacion;
    private String estadoLaboral;
    private String email;
    private String role;
    private boolean has2FA;
    private boolean enabled;
    private boolean verified;

    // Getters y setters existentes
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    // Nuevo getter y setter para usuarioId
    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCodigoEstudiante() { return codigoEstudiante; }
    public void setCodigoEstudiante(String codigoEstudiante) { this.codigoEstudiante = codigoEstudiante; }

    public String getCarrera() { return carrera; }
    public void setCarrera(String carrera) { this.carrera = carrera; }

    public Integer getAnoGraduacion() { return anoGraduacion; }
    public void setAnoGraduacion(Integer anoGraduacion) { this.anoGraduacion = anoGraduacion; }

    public String getEstadoLaboral() { return estadoLaboral; }
    public void setEstadoLaboral(String estadoLaboral) { this.estadoLaboral = estadoLaboral; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isHas2FA() { return has2FA; }
    public void setHas2FA(boolean has2FA) { this.has2FA = has2FA; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}