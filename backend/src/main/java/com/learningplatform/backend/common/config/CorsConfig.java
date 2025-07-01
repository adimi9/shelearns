package com.learningplatform.backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Apply CORS to all endpoints in your application
                .allowedOrigins(
                        "http://localhost:3000", // Your Next.js development URL
                        "https://your-app-name.vercel.app" // <--- REPLACE WITH YOUR ACTUAL VERCEL URL
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
                .allowedHeaders("*") // Allow all headers
                .allowCredentials(true) // Allow sending of cookies, authorization headers, etc.
                .maxAge(3600); // How long the CORS pre-flight request can be cached
    }
}
