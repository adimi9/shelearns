// define User Entity
// what columns should exist in database, what their types are, and any constraints
package com.learningplatform.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime; // Or java.util.Date

@Entity
@Table(name = "users") // Avoid 'user' as it can be a reserved keyword in some DBs
public class User {

    @Id // primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // database generates ID (auto-increment)
    private Long id;

    @Column(nullable = false) // cannot be null
    private String name;

    @Column(nullable = false, unique = true) // cannot be null, each email unique
    private String email;

    @Column(nullable = false) // cannot be null
    private String passwordHash;

    @Column(nullable = false) // cannot be null
    private LocalDateTime createdAt;

    // default constructor
    public User() {
        this.createdAt = LocalDateTime.now();
    }

    public User(String name, String email, String passwordHash) {
        this(); // Call default constructor to set createdAt
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}