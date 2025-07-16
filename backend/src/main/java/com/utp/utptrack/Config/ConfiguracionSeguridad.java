package com.utp.utptrack.Config;

import com.utp.utptrack.Security.CustomAuthenticationFilter;
import com.utp.utptrack.Security.JwtAuthenticationFilter;
import com.utp.utptrack.Security.CustomUserDetailsService;
import com.utp.utptrack.Services.JwtService;
import com.utp.utptrack.Services.UsuarioService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class ConfiguracionSeguridad {

    private final JwtService jwtService;
    private final UsuarioService usuarioService;
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService customUserDetailsService;

    public ConfiguracionSeguridad(JwtService jwtService,
                                  UsuarioService usuarioService,
                                  JwtAuthenticationFilter jwtAuthFilter,
                                  CustomUserDetailsService customUserDetailsService) {
        this.jwtService = jwtService;
        this.usuarioService = usuarioService;
        this.jwtAuthFilter = jwtAuthFilter;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return new ProviderManager(authenticationProvider());
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationManager authenticationManager) throws Exception {
        CustomAuthenticationFilter customAuthenticationFilter = new CustomAuthenticationFilter(
                authenticationManager, jwtService, usuarioService);
        customAuthenticationFilter.setFilterProcessesUrl("/api/auth/login");

        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/registro-egresado",
                                "/api/auth/2fa/verificar",
                                "/api/auth/2fa/configurar",
                                "/api/auth/2fa/activar",
                                "/api/auth/2fa/estado"
                        ).permitAll()
                        .requestMatchers("/exports/**").permitAll()
                        .requestMatchers("/api/reportes/guardados/descargar-archivo/**").permitAll()
                        .requestMatchers("/api/reportes/guardados/**").hasAnyRole("ADMIN", "EGRESADO")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/usuarios/**").hasRole("ADMIN")
                        .requestMatchers("/api/egresados/**").hasAnyRole("ADMIN", "EGRESADO")
                        .requestMatchers("/api/experiencias-laborales/**").hasAnyRole("ADMIN", "EGRESADO")
                        .requestMatchers("/api/reportes/**").hasAnyRole("ADMIN", "EGRESADO")
                        .requestMatchers("/api/dashboard/**").hasRole("EGRESADO")
                        .anyRequest().authenticated())
                .addFilter(customAuthenticationFilter)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}