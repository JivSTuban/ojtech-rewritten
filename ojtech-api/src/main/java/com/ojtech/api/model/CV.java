package com.ojtech.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cvs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CV {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileUrl; // URL from Cloudinary or other storage

    private String fileType; // e.g., "application/pdf"

    private Long fileSize; // in bytes

    private LocalDateTime uploadedAt;

    private boolean isActive = false; // Indicates if this is the primary CV for the profile

    @Column(columnDefinition = "TEXT")
    private String extractedText; // Text extracted from CV by parser

    @Column(columnDefinition = "TEXT")
    private String skillsJson; // Parsed skills stored as JSON string

    @Column(columnDefinition = "TEXT")
    private String experienceJson; // Parsed experience stored as JSON string

    @Column(columnDefinition = "TEXT")
    private String educationJson; // Parsed education stored as JSON string

    private String processingStatus; // e.g., PENDING, PROCESSING, COMPLETED, FAILED
    private String processingError;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }

    public CV(Profile profile, String fileName, String fileUrl) {
        this.profile = profile;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.uploadedAt = LocalDateTime.now();
    }
}
