package com.learningplatform.backend.model.course.resources;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "quiz")
@Data
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private Resource resource;

    @Column(name = "question_order")
    private int questionOrder;
}
