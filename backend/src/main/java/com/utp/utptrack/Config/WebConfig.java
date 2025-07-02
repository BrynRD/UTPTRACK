package com.utp.utptrack.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/exports/**")
                .addResourceLocations("file:./backend/exports/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/exports/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "HEAD");
    }
} 