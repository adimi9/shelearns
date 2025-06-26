package com.learningplatform.backend.security.jwt;

import java.security.Key;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value; // To inject properties from application.properties
import org.springframework.stereotype.Component;

import com.learningplatform.backend.security.services.UserDetailsImpl; // Your UserDetails implementation

import io.jsonwebtoken.*; // Important JWT imports
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${learningplatform.app.jwtSecret}") // Inject your JWT secret from application.properties
    private String jwtSecret;

    @Value("${learningplatform.app.jwtExpirationMs}") // Inject JWT expiration time from application.properties
    private int jwtExpirationMs;

    // Helper method to get the signing key
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    // Generates a JWT from UserDetailsImpl (after successful login)
    public String generateJwtToken(UserDetailsImpl userPrincipal) {
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername()) // Set subject (username/email)
                .setIssuedAt(new Date())                 // Set issue date
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) // Set expiration date
                .signWith(key(), SignatureAlgorithm.HS512) // Sign with your secret key
                .compact(); // Build and compact the JWT to a string
    }

    // Gets the username (email) from the JWT
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    // Validates the JWT
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}