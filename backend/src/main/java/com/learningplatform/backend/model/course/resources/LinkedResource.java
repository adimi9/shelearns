package com.learningplatform.backend.model.course.resources;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "linked_resource")
@Data
public class LinkedResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private Resource resource;

    private String name;
    private String description;
    private String link;
}
