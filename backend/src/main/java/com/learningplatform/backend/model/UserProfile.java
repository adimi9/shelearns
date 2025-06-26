package com.learningplatform.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Table;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;


@Entity
@Table(name = "user_profiles")
public class UserProfile {

    // Fields 

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    // Foreign Keys and Relationships

    @ManyToOne(fetch = FetchType.LAZY) // LAZY: avatar is fetched only when accessed
    @JoinColumn(name = "avatar_id") 
    private Avatar avatar; 


    // Constructors

    // Default constructor
    public UserProfile() {} 

    // Constructor with parameters
    public UserProfile(Avatar avatar) {
        this(); 
        this.avatar = avatar; 
    }


    // Getters and Setters 

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id;}

    public Avatar getAvatar() { return avatar; }
    public void setAvatar(Avatar avatar) { this.avatar = avatar; }




    
}
