// define User Entity
// what columns should exist in database, what their types are, and any constraints
package com.learningplatform.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime; 
import java.util.HashSet; 
import java.util.Set;     

@Entity
@Table(name = "users") // Avoid 'user' as it can be a reserved keyword in some DBs
public class User {

    // Columns

    @Id // primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    @Column(nullable = false) 
    private String name;

    @Column(nullable = false, unique = true) 
    private String email;

    @Column(nullable = false) 
    private String passwordHash;

    @Column(nullable = false) 
    private LocalDateTime createdAt;

    @ManyToMany(fetch = FetchType.LAZY) // LAZY: roles are fetched only when accessed
    @JoinTable(
        name = "user_roles", // Name of the join table in the database
        joinColumns = @JoinColumn(name = "user_id"), // Column in user_roles linking to users table
        inverseJoinColumns = @JoinColumn(name = "role_id")) // Column in user_roles linking to roles table
    private Set<Role> roles = new HashSet<>(); // Initialise to prevent NullPointerException

    // Constructors

    // Default constructor
    public User() { 
        this.createdAt = LocalDateTime.now();
    }

    // Constructor with parameters
    public User(String name, String email, String passwordHash, Set<Role> roles) {
        this(); 
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles; 
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

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

}