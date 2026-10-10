package com.academix.academix_backend.model;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity
@Table(name = "lessons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "content_url")
    private String contentUrl; // YouTube URL, PDF, etc.

    @Column(name = "content_type")
    private String contentType; // VIDEO, PDF, TEXT, LINK

    @Column(name = "order_number")
    private Integer orderNumber;

    @Column(name = "duration_minutes")
    private Integer durationMinutes; // For video lessons

    @Builder.Default
    @Column(name = "is_free_preview")
    private Boolean isFreePreview = false;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}