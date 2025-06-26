package com.learningplatform.backend.model;

// can be shortened to jakarta.persistence.* but just for learning purposes, we will keep it explicit
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;

import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.CascadeType;

@Entity
@Table(name = "users") 
public class User {

    // Fields

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    @Column(nullable = false, unique = true) 
    private String name;

    @Column(nullable = false, unique = true) 
    private String email;

    @Column(nullable = false) 
    private String passwordHash; // stores hashed password, NOT actual password (security purposes!)

    // Foreign Keys and Relationships

    @ManyToOne(fetch = FetchType.EAGER) // EAGER: role is fetched immediately with the user
    @JoinColumn(name = "role_id", nullable = false)
    private Role role; 

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY) // LAZY: avatar is fetched only when accessed
    @JoinColumn(name = "user_profile_id") 
    private UserProfile userProfile; 

    // Constructors

    // Default constructor
    public User() {}

    // Constructor with parameters
    public User(String name, String email, String passwordHash, Role role) {
        this(); 
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role; 
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

    public Role getRole() { return role; }
    public void setRoles(Role role) { this.role = role; }

    public UserProfile getUserProfile() { return userProfile; } 
    public void setUserProfile(UserProfile userProfile) { this.userProfile = userProfile; }

}