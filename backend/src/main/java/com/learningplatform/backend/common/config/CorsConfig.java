package com.learningplatform.backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*") // TEMPORARY: ALLOW ALL ORIGINS FOR TESTING
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true) // NOTE: allowedCredentials(true) with allowedOrigins("*") is generally not allowed by browsers for security reasons. If you keep allowedOrigins("*"), set allowCredentials(false). For testing, you might need to temporarily disable allowCredentials or specifically allow your origin. Given your original setup, keep allowCredentials(true) and go back to specific origins if this test fails.
                .maxAge(3600);
    }
}