package com.utp.utptrack.Services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import com.utp.utptrack.Models.Usuario;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;
import java.nio.charset.StandardCharsets;

@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret:w9$kL!2pQz8@rT5vB1#xY7eF3uH6jN0s}")
    private String SECRET_KEY;

    @Value("${jwt.expiration:86400000}") // 24 horas en milisegundos
    private long EXPIRATION_TIME;

    private Key getSigningKey() {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());
    }

    public String generateToken(Usuario usuario) {
        logger.info("Generando token JWT para usuario: {}", usuario.getUsername());

        // Usar el rol crudo (ROLE_ADMIN, ROLE_EGRESADO)
        String role = usuario.getRole();
        if (role == null || role.isEmpty()) {
            role = "ROLE_USER";
            logger.warn("Usuario {} sin rol asignado, usando rol predeterminado: {}", usuario.getUsername(), role);
        }

        String token = Jwts.builder()
                .claim("username", usuario.getUsername())
                .claim("email", usuario.getEmail())
                .claim("role", role) // Ahora el claim es ROLE_ADMIN o ROLE_EGRESADO
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        logger.debug("Token generado con rol: {}", role);
        return token;
    }

    public String extractRole(String token) {
        try {
            String role = extractClaim(token, claims -> claims.get("role", String.class));
            // Nunca devolver null para el rol
            if (role == null) {
                logger.warn("Rol no encontrado en el token, usando rol predeterminado");
                return "USER"; // Rol predeterminado
            }
            logger.debug("Rol extraído del token: {}", role);
            return role;
        } catch (Exception e) {
            logger.warn("Error al extraer rol del token: {}", e.getMessage());
            return "USER"; // Cambiado de ROLE_DEFAULT a USER para consistencia
        }
    }

    public String extractUsername(String token) {
        try {
            return extractClaim(token, claims -> claims.get("username", String.class));
        } catch (Exception e) {
            logger.warn("Error al extraer username del token: {}", e.getMessage());
            return null;
        }
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            logger.warn("Token expirado: {}", e.getMessage());
            throw e;
        } catch (SignatureException e) {
            logger.warn("Firma de token inválida: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error al procesar token: {}", e.getMessage());
            throw e;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            logger.warn("Error al verificar expiración del token: {}", e.getMessage());
            return true;
        }
    }

    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            logger.warn("Error al validar token: {}", e.getMessage());
            return false;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean isValid = (username != null && username.equals(userDetails.getUsername())) && !isTokenExpired(token);
            logger.debug("Token validado para {}: {}", username, isValid);
            return isValid;
        } catch (Exception e) {
            logger.error("Error al validar token para userDetails: {}", e.getMessage());
            return false;
        }
    }
}