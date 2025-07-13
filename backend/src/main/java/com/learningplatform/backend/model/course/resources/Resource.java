package com.learningplatform.backend.model.course.resources;

import com.learningplatform.backend.model.course.resources.enums.ResourceType;

import jakarta.persistence.*;

@Entity
@Table(name = "Resource")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Resource_ID")
    private Long resourceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Level_ID", nullable = false)
    private CourseLevel courseLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "Resource_Type", insertable = false, updatable = false)
    private ResourceType resourceType;

    @Column(name = "Resource_XP")
    private Integer resourceXp;

    @Column(name = "Resource_Order")
    private Integer resourceOrder;

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public CourseLevel getCourseLevel() { return courseLevel; }
    public void setCourseLevel(CourseLevel courseLevel) { this.courseLevel = courseLevel; }

    public ResourceType getResourceType() { return resourceType; }
    public void setResourceType(ResourceType resourceType) { this.resourceType = resourceType; }

    public Integer getResourceXp() { return resourceXp; }
    public void setResourceXp(Integer resourceXp) { this.resourceXp = resourceXp; }

    public Integer getResourceOrder() { return resourceOrder; }
    public void setResourceOrder(Integer resourceOrder) { this.resourceOrder = resourceOrder; }
}
