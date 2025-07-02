package com.utp.utptrack.Security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.utp.utptrack.Models.Usuario;
import com.utp.utptrack.Services.JwtService;
import com.utp.utptrack.Services.UsuarioService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class CustomAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final JwtService jwtService;
    private final UsuarioService usuarioService;

    public CustomAuthenticationFilter(AuthenticationManager authenticationManager, JwtService jwtService, UsuarioService usuarioService) {
        setAuthenticationManager(authenticationManager);
        setFilterProcessesUrl("/api/auth/login");
        this.jwtService = jwtService;
        this.usuarioService = usuarioService;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {

        // Verificar si hay contenido disponible
        if (request.getContentLength() <= 0) {
            System.out.println("Solicitud sin contenido - posiblemente OPTIONS o preflight");
            throw new AuthenticationException("Solicitud sin contenido") {};
        }

        // Leer el cuerpo JSON de la solicitud
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, String> credenciales;

        try {
            credenciales = objectMapper.readValue(
                    request.getInputStream(),
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {}
            );
        } catch (IOException e) {
            System.err.println("Error al deserializar JSON: " + e.getMessage());
            throw new AuthenticationException("Formato de solicitud inválido", e) {};
        }

        String username = credenciales.get("username");
        String password = credenciales.get("password");

        if (username == null || password == null) {
            System.err.println("Credenciales incompletas: username o password faltantes");
            throw new AuthenticationException("Credenciales incompletas") {};
        }

        System.out.println("Intento de autenticación para usuario: " + username);

        // Crear token de autenticación
        return getAuthenticationManager().authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                            FilterChain chain, Authentication authResult) throws IOException, ServletException {
        UserDetails userDetails = (UserDetails) authResult.getPrincipal();
        Usuario usuario = usuarioService.buscarPorUsername(userDetails.getUsername());

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        Map<String, Object> responseBody = new HashMap<>();

        if (usuario.isActivado2fa()) {
            responseBody.put("requiere2FA", true);
        } else {
            String token = jwtService.generateToken(usuario);
            responseBody.put("requiere2FA", false);
            responseBody.put("token", token);
        }

        new ObjectMapper().writeValue(response.getWriter(), responseBody);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                              AuthenticationException failed) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        Map<String, Object> responseBody = new HashMap<>();

        String mensaje = "Credenciales inválidas";
        if (failed != null && failed.getMessage() != null) {
            System.err.println("Error de autenticación: " + failed.getMessage());

            // Traducción de mensajes comunes de error
            if (failed.getMessage().contains("Bad credentials")) {
                mensaje = "Usuario o clave incorrectos";
            } else if (failed.getMessage().contains("User is disabled")) {
                mensaje = "Usuario deshabilitado";
            } else if (failed.getMessage().contains("User account has expired")) {
                mensaje = "Cuenta de usuario expirada";
            } else if (failed.getMessage().contains("User account is locked")) {
                mensaje = "Cuenta bloqueada";
            } else if (failed.getMessage().contains("Solicitud sin contenido")) {
                mensaje = "Solicitud sin contenido";
            } else if (failed.getMessage().contains("Formato de solicitud inválido")) {
                mensaje = "Formato de solicitud inválido";
            } else if (failed.getMessage().contains("Credenciales incompletas")) {
                mensaje = "Usuario y contraseña son requeridos";
            } else {
                mensaje = "Error de autenticación: " + failed.getMessage();
            }

            if (failed.getCause() != null) {
                failed.getCause().printStackTrace();
            }
        }

        responseBody.put("mensaje", mensaje);
        responseBody.put("error", true);
        responseBody.put("timestamp", System.currentTimeMillis());
        new ObjectMapper().writeValue(response.getWriter(), responseBody);
    }}