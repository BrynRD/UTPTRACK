package com.utp.utptrack.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.util.Date;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "egresados")
public class Egresado {

    @Id
    private String id;

    private String nombre;
    private String apellido;
    private String correo;
    private String codigoEstudiante;
    private Integer edad;
    private String genero;
    private String carrera;
    private String sede;
    private Integer anoGraduacion;
    private String estadoLaboral;
    private String habilidadesTecnicas;
    private String habilidadesBlandas;
    private String telefono;
    private String dni;
    private String linkedin;
    private Boolean tiene2fa;
    private Integer satisfaccionFormacion;
    private Integer tiempoPrimerEmpleo;
    private String empresa;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @OneToOne(mappedBy = "egresado", cascade = CascadeType.ALL)
    @JsonBackReference
    private Usuario usuario;

    @OneToMany(mappedBy = "egresado", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExperienciaLaboral> experienciasLaborales;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    // Getters y setters originales
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    // Nuevos getters y setters para los campos añadidos
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    // Método alternativo para compatibilidad con el servicio (alias)
    public String getEmail() { return correo; }
    public void setEmail(String email) { this.correo = email; }

    // Método alternativo para compatibilidad con el servicio (alias)
    public String getApellidos() { return apellido; }
    public void setApellidos(String apellidos) { this.apellido = apellidos; }

    public String getEmpresa() { return empresa; }
    public void setEmpresa(String empresa) { this.empresa = empresa; }

    // Método alternativo para compatibilidad con el servicio (alias)
    public String getEmpresaActual() { return empresa; }
    public void setEmpresaActual(String empresaActual) { this.empresa = empresaActual; }

    public String getCodigoEstudiante() { return codigoEstudiante; }
    public void setCodigoEstudiante(String codigoEstudiante) { this.codigoEstudiante = codigoEstudiante; }

    public Integer getEdad() { return edad; }
    public void setEdad(Integer edad) { this.edad = edad; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public String getCarrera() { return carrera; }
    public void setCarrera(String carrera) { this.carrera = carrera; }

    public String getSede() { return sede; }
    public void setSede(String sede) { this.sede = sede; }

    public Integer getAnoGraduacion() { return anoGraduacion; }
    public void setAnoGraduacion(Integer anoGraduacion) { this.anoGraduacion = anoGraduacion; }

    public String getEstadoLaboral() { return estadoLaboral; }
    public void setEstadoLaboral(String estadoLaboral) { this.estadoLaboral = estadoLaboral; }

    public String getHabilidadesTecnicas() { return habilidadesTecnicas; }
    public void setHabilidadesTecnicas(String habilidadesTecnicas) { this.habilidadesTecnicas = habilidadesTecnicas; }

    public String getHabilidadesBlandas() { return habilidadesBlandas; }
    public void setHabilidadesBlandas(String habilidadesBlandas) { this.habilidadesBlandas = habilidadesBlandas; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }

    public Boolean getTiene2fa() { return tiene2fa; }
    public void setTiene2fa(Boolean tiene2fa) { this.tiene2fa = tiene2fa; }

    public Integer getSatisfaccionFormacion() { return satisfaccionFormacion; }
    public void setSatisfaccionFormacion(Integer satisfaccionFormacion) { this.satisfaccionFormacion = satisfaccionFormacion; }

    public Integer getTiempoPrimerEmpleo() { return tiempoPrimerEmpleo; }
    public void setTiempoPrimerEmpleo(Integer tiempoPrimerEmpleo) { this.tiempoPrimerEmpleo = tiempoPrimerEmpleo; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public List<ExperienciaLaboral> getExperienciasLaborales() { return experienciasLaborales; }
    public void setExperienciasLaborales(List<ExperienciaLaboral> experienciasLaborales) { this.experienciasLaborales = experienciasLaborales; }
}