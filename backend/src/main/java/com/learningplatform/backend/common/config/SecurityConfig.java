package com.learningplatform.backend.common.config; // Ensure this package is correct

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter; // Already imported

import com.learningplatform.backend.features.auth.util.JwtUtil;

import java.io.IOException;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Allow OPTIONS requests for all paths (preflight requests)
                // This must come *before* any other authorization rules that might block OPTIONS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/api/auth/signup",
                    "/api/auth/login"
                ).permitAll()
                .anyRequest().authenticated()
            )
            // Add your custom JWT filter before Spring Security's default username/password filter
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // --- UPDATED JwtAuthenticationFilter ---
    public static class JwtAuthenticationFilter extends OncePerRequestFilter {

        private final JwtUtil jwtUtil;

        public JwtAuthenticationFilter(JwtUtil jwtUtil) {
            this.jwtUtil = jwtUtil;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                         HttpServletResponse response,
                                         FilterChain filterChain) throws ServletException, IOException {

            // IMPORTANT: Skip JWT authentication for OPTIONS requests
            // Browsers send OPTIONS preflight requests which do not carry auth headers.
            // These should be handled by CORS configuration, not blocked by authentication.
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                response.setStatus(HttpServletResponse.SC_OK); // ← Ensure this gets a 200
                return;
            }

            String header = request.getHeader("Authorization");

            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                try {
                    Long userId = jwtUtil.validateTokenAndGetUserId(token);
                    // For stateless JWT, you often don't need a UserDetails object from a service.
                    // Instead, directly create an Authentication object with the user ID/principal.
                    Authentication auth = new UsernamePasswordAuthenticationToken(userId, null, List.of()); // No roles specified here, adjust if needed
                    SecurityContextHolder.getContext().setAuthentication(auth);

                } catch (RuntimeException e) {
                    // Log the exception for debugging
                    System.err.println("JWT Validation Error: " + e.getMessage());
                    SecurityContextHolder.clearContext(); // Clear context on invalid token
                    // Optionally, you could send an explicit 401 response here
                    // response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    // return;
                }
            }

            filterChain.doFilter(request, response);
        }
    }
}