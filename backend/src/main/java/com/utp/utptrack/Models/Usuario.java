package com.utp.utptrack.Models;

import jakarta.persistence.*;
import java.util.Date;
import java.util.Set;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "usuarios")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Usuario {

    @Id
    private String id; // UUID

    @Column(unique = true)
    private String username;

    private String password;
    private String secreto2fa;
    private boolean activado2fa;

    @Column(unique = true)
    private String email;

    // Añadido el campo role que existe en la base de datos
    @Column(name = "role")
    private String role;

    private boolean enabled = true;
    private boolean verified = false;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @Column(name = "last_login")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastLogin;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_egresado")
    private Egresado egresado;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "usuario_roles",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "rol_id")
    )
    private Set<Rol> roles;

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

    // Getters y setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getSecreto2fa() { return secreto2fa; }
    public void setSecreto2fa(String secreto2fa) { this.secreto2fa = secreto2fa; }

    public boolean isActivado2fa() { return activado2fa; }
    public void setActivado2fa(boolean activado2fa) { this.activado2fa = activado2fa; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    // Getter y setter para el campo role de la base de datos
    public String getDirectRole() { return role; }
    public void setDirectRole(String role) { this.role = role; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public Date getLastLogin() { return lastLogin; }
    public void setLastLogin(Date lastLogin) { this.lastLogin = lastLogin; }

    public Egresado getEgresado() { return egresado; }
    public void setEgresado(Egresado egresado) { this.egresado = egresado; }

    public Set<Rol> getRoles() { return roles; }
    public void setRoles(Set<Rol> roles) { this.roles = roles; }

    // Devuelve el primer rol (nombre crudo, ej: ROLE_ADMIN)
    public String getRole() {
        if (roles != null && !roles.isEmpty()) {
            return roles.iterator().next().getNombre();
        }
        return null;
    }

    // Devuelve el rol mapeado para el frontend (ADMIN, GRADUATE, etc)
    public String getMappedRole() {
        String dbRole = getRole();
        if (dbRole == null) return null;
        if ("ROLE_ADMIN".equals(dbRole)) return "ADMIN";
        if ("ROLE_EGRESADO".equals(dbRole)) return "GRADUATE";
        return dbRole.replace("ROLE_", "");
    }
}