// File: src/main/java/com/learningplatform/backend/config/SecurityConfig.java

package com.learningplatform.backend.config;

import com.learningplatform.backend.security.jwt.AuthEntryPointJwt; // For handling unauthorized access
import com.learningplatform.backend.security.jwt.AuthTokenFilter;   // Your JWT filter
import com.learningplatform.backend.security.jwt.JwtUtils;         // Your JWT utility class
import com.learningplatform.backend.security.services.UserDetailsServiceImpl; // Your custom UserDetailsService

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager; // Core authentication component
import org.springframework.security.authentication.dao.DaoAuthenticationProvider; // Provider for UserDetailsService
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration; // For AuthenticationManager bean
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // Enables @PreAuthorize, @PostAuthorize
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy; // For stateless sessions with JWT
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // To place your JWT filter before it

@Configuration
@EnableWebSecurity // Enables Spring Security's web security features
@EnableMethodSecurity // Enables method-level security like @PreAuthorize
public class SecurityConfig {

    // --- Inject your custom security services and utilities ---
    private final UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final JwtUtils jwtUtils; // Needed if AuthTokenFilter requires it in its constructor

    // Constructor Injection for dependencies
    public SecurityConfig(UserDetailsServiceImpl userDetailsService,
                          AuthEntryPointJwt unauthorizedHandler,
                          JwtUtils jwtUtils) { // Inject JwtUtils if your AuthTokenFilter uses it
        this.userDetailsService = userDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
        this.jwtUtils = jwtUtils;
    }

    // --- Define the PasswordEncoder bean ---
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Strong, commonly used password encoder
    }

    // --- Define the DaoAuthenticationProvider bean ---
    // This provider uses your UserDetailsService and PasswordEncoder
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService); // Tell Spring Security to use your service
        authProvider.setPasswordEncoder(passwordEncoder());     // Set your password encoder
        return authProvider;
    }

    // --- Define the AuthenticationManager bean ---
    // This is the central component for authenticating users
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // --- Define your custom JWT Authentication Filter bean ---
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        // Your AuthTokenFilter likely needs JwtUtils and UserDetailsServiceImpl
        // to extract, validate the token, and load user details.
        return new AuthTokenFilter(jwtUtils, userDetailsService);
    }


    // --- Configure the SecurityFilterChain (the core of your web security) ---
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for stateless APIs (JWT-based)
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler)) // Handle unauthorized access attempts
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Tell Spring Security not to create sessions
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/auth/**").permitAll() // Allow signup and login endpoints without authentication
                // Add any other public endpoints here, e.g., for testing:
                // .requestMatchers("/api/test/**").permitAll()
                .anyRequest().authenticated() // All other requests require authentication
            );

        // Tell Spring Security to use your custom authentication provider
        http.authenticationProvider(authenticationProvider());

        // Add your custom JWT filter before Spring's default UsernamePasswordAuthenticationFilter
        // This ensures your JWT is processed first for authentication
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}