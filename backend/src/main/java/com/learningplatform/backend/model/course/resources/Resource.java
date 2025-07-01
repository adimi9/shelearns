package com.learningplatform.backend.model.course.resources;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "resource")
@Data
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Long resourceId;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "resource_type")
    private String resourceType;

    @Column(name = "resource_xp")
    private int resourceXP;
}
