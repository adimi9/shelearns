package com.learningplatform.backend.model;

import com.learningplatform.backend.model.enums.EAvatar;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;


@Entity
@Table(name = "user_profiles")
public class UserProfile {

    // Fields 

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    // Foreign Keys and Relationships

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EAvatar avatar;


    // Constructors

    // Default constructor
    public UserProfile() {} 

    // Constructor with parameters
    public UserProfile(EAvatar avatar) {
        this(); 
        this.avatar = avatar; 
    }


    // Getters and Setters 

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id;}

    public EAvatar getAvatar() { return avatar; }
    public void setAvatar(EAvatar avatar) { this.avatar = avatar; }




    
}
