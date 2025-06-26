package com.learningplatform.backend.security.services;

import com.learningplatform.backend.model.User; // Your JPA User entity
import com.fasterxml.jackson.annotation.JsonIgnore; // Import for JsonIgnore

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors; // Make sure to import this

public class UserDetailsImpl implements UserDetails {

    private Long id; // Your User's primary key (important for your application logic)

    private String name; // User's display name

    private String email; // User's email, typically used as the username for authentication

    @JsonIgnore // Prevents the hashed password from being serialized (e.g., into a JWT)
    private String password; // The user's hashed password from the database

    private Collection<? extends GrantedAuthority> authorities; // User's roles/permissions

    // Private constructor - use the static build method to create instances
    private UserDetailsImpl(Long id, String name, String email, String password,
                            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    // Static factory method to create a UserDetailsImpl object from your User entity
    // This is where you map your User entity's data to the UserDetails interface methods
    public static UserDetailsImpl build(User user) {
        // Assuming your User entity has a single Role object
        // and Role.getName() returns an ERole enum (e.g., ERole.ROLE_USER)
        List<GrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority(user.getRole().getName().name())
        );

        // If your User entity had a Set<Role> for many-to-many roles, it would look like this:
        // List<GrantedAuthority> authorities = user.getRoles().stream()
        //         .map(role -> new SimpleGrantedAuthority(role.getName().name()))
        //         .collect(Collectors.toList());

        return new UserDetailsImpl(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPasswordHash(), // Assuming your User entity stores the hashed password here
                authorities
        );
    }

    // --- Implementations of UserDetails interface methods ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() { // Spring Security uses this method for the "username" field
        return email; // We're using email as the username for authentication
    }

    // --- Custom method to get your application's User ID ---
    public Long getId() {
        return id;
    }

    // --- Other custom getters (optional, but useful) ---
    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    // --- Default implementations for account status (customize if your app needs these features) ---
    @Override
    public boolean isAccountNonExpired() {
        return true; // Return true unless you have an account expiration policy
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Return true unless you have an account locking policy (e.g., too many failed logins)
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Return true unless you have a password expiration policy
    }

    @Override
    public boolean isEnabled() {
        return true; // Return true unless you have an account enable/disable feature
    }

    // --- Override equals and hashCode for proper comparison (important for Spring Security's internal use) ---
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id); // Compare by ID for equality
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}