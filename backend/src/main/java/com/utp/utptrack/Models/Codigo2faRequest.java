package com.utp.utptrack.Models;

public class Codigo2faRequest {
    private String secreto;
    private Integer codigo;
    private String codigoInstitucional;
    private String username;  // Nuevo campo para manejar username

    // Constructores
    public Codigo2faRequest() {}

    public Codigo2faRequest(String secreto, Integer codigo, String codigoInstitucional, String username) {
        this.secreto = secreto;
        this.codigo = codigo;
        this.codigoInstitucional = codigoInstitucional;
        this.username = username;
    }

    // Getters y setters
    public String getSecreto() {
        return secreto;
    }

    public void setSecreto(String secreto) {
        this.secreto = secreto;
    }

    public Integer getCodigo() {
        return codigo;
    }

    public void setCodigo(Integer codigo) {
        this.codigo = codigo;
    }

    public String getCodigoInstitucional() {
        return codigoInstitucional != null ? codigoInstitucional : username;
    }

    public void setCodigoInstitucional(String codigoInstitucional) {
        this.codigoInstitucional = codigoInstitucional;
    }

    public String getUsername() {
        return username != null ? username : codigoInstitucional;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}