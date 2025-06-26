package com.learningplatform.backend.security.services;

import com.learningplatform.backend.model.User; // Your JPA User entity
import com.fasterxml.jackson.annotation.JsonIgnore; // Import for JsonIgnore

import org.springframework.security.core.GrantedAuthority;
// import org.springframework.security.core.authority.SimpleGrantedAuthority; // No longer needed if no roles
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections; // Import for Collections.emptyList()
import java.util.Objects;

public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String name;
    private String email;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities; // Still needed for the interface

    // Restoring the constructor with authorities
    private UserDetailsImpl(Long id, String name, String email, String password,
                            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.authorities = authorities; // Assign authorities here
    }

    public static UserDetailsImpl build(User user) {
        // --- FIX HERE: Return an empty list of authorities if no role information is available ---
        // If you decide later to add a general "authenticated" role for all users, it would be:
        // List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_AUTHENTICATED"));
        Collection<? extends GrantedAuthority> authorities = Collections.emptyList();


        return new UserDetailsImpl(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPasswordHash(),
                authorities // Pass the empty list of authorities to the constructor
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}