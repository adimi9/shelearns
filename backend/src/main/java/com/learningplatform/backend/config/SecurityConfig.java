package com.learningplatform.backend.config;

import com.learningplatform.backend.security.jwt.AuthEntryPointJwt;
import com.learningplatform.backend.security.jwt.AuthTokenFilter;
import com.learningplatform.backend.security.jwt.JwtUtils;
import com.learningplatform.backend.security.services.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // Use this for @PreAuthorize/@PostAuthorize
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity // Enables Spring Security's web integration
@EnableMethodSecurity // Enables method-level security (e.g., @PreAuthorize)
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final JwtUtils jwtUtils;

    // Constructor Injection for dependencies - Spring will automatically inject these beans
    public SecurityConfig(UserDetailsServiceImpl userDetailsService,
                          AuthEntryPointJwt unauthorizedHandler,
                          JwtUtils jwtUtils) {
        this.userDetailsService = userDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Defines the PasswordEncoder bean.
     * Uses BCryptPasswordEncoder for strong password hashing.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures the DaoAuthenticationProvider.
     * This provider uses our custom UserDetailsService and the defined PasswordEncoder
     * to authenticate users against the database.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService); // Injects our UserDetailsService
        authProvider.setPasswordEncoder(passwordEncoder()); // Uses the passwordEncoder bean
        return authProvider;
    }

    /**
     * Exposes the AuthenticationManager bean.
     * Required for authenticating users, e.g., during login.
     * Spring Boot 3+ automatically exposes this via AuthenticationConfiguration.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * Defines the custom JWT authentication filter.
     * This filter extracts and validates JWT tokens from incoming requests.
     */
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        // Correctly injects JwtUtils and UserDetailsServiceImpl into the filter
        return new AuthTokenFilter(jwtUtils, userDetailsService);
    }

    /**
     * Configures the SecurityFilterChain, which defines the security rules for HTTP requests.
     * This is the core of Spring Security configuration in Spring Boot 3+.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for stateless APIs
            .csrf(csrf -> csrf.disable())
            // Configure exception handling for unauthenticated requests
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            // Set session management to stateless (important for JWT)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Define authorization rules for HTTP requests
            .authorizeHttpRequests(authorize -> authorize
                // Allow access to authentication endpoints without authentication
                .requestMatchers("/api/auth/**").permitAll()
                // Require authentication for all other requests
                .anyRequest().authenticated()
            );

        // Register the custom DaoAuthenticationProvider
        // This is crucial for Spring Security to know how to authenticate users
        http.authenticationProvider(authenticationProvider());

        // Add the JWT token filter before the standard UsernamePasswordAuthenticationFilter
        // This ensures JWT-based authentication happens first.
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        // Build and return the SecurityFilterChain
        return http.build();
    }
}