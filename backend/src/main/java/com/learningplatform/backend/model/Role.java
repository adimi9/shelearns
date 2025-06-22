// Role Entity Class
package com.learningplatform.backend.model;

import com.learningplatform.backend.model.enums.ERole; // ERole enum
import jakarta.persistence.*;

@Entity
@Table(name = "roles") // table name for roles
public class Role {

    // Columns

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; 

    @Enumerated(EnumType.STRING) // Store enum name as a String in the DB
    @Column(length = 20, nullable = false, unique = true) // Max length for role name, must be unique
    private ERole name; // The enum value (e.g., ROLE_USER, ROLE_ADMIN)

    // Constructors

    // Default constructor
    public Role() {} 

    // Constructor with parameters
    public Role(ERole name) { 
        this.name = name; 
    } 

    // Getters and Setters

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public ERole getName() { return name;}
    public void setName(ERole name) { this.name = name; }
}