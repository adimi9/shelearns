// src/main/java/com/learningplatform/backend/config/SecurityConfig.java
package com.learningplatform.backend.config; // Ensure this package is scanned by Spring

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain; // Import for Spring Security 6

@Configuration
@EnableWebSecurity // Enables Spring Security's web security features
public class SecurityConfig {

    // Define the PasswordEncoder bean
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCryptPasswordEncoder is a strong, commonly used password encoder
        return new BCryptPasswordEncoder();
    }

    // Basic SecurityFilterChain (you might adjust this based on your actual security needs)
    // This is a minimal setup to satisfy Spring Security's requirements
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for API tests (consider enabling and securing for production)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/auth/**").permitAll() // Allow signup and login
                        .anyRequest().authenticated() // All other requests require authentication
                );
        return http.build();
    }
}