// Role Entity Class
package com.learningplatform.backend.model;

import com.learningplatform.backend.model.enums.EAvatar; // ERole enum
import jakarta.persistence.*;

@Entity
@Table(name = "avatars") // table name for roles
public class Avatar {

    // Columns

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 

    @Enumerated(EnumType.STRING) // Store enum name as a String in the DB
    @Column(length = 20, nullable = false, unique = true) // Max length for role name, must be unique
    private EAvatar name; // The enum value (e.g., ROLE_USER, ROLE_ADMIN)

    // Constructors

    // Default constructor
    public Avatar() {} 

    // Constructor with parameters
    public Avatar(EAvatar name) { 
        this.name = name; 
    } 

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EAvatar getName() { return name;}
    public void setName(EAvatar name) { this.name = name; }
}