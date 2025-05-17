package com.ojtech.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "job_id")
    @NotNull
    private Job job;

    @ManyToOne
    @JoinColumn(name = "student_id")
    @NotNull
    private Profile student;

    @ManyToOne
    @JoinColumn(name = "cv_id")
    @NotNull
    private CV cv;

    private String coverLetter;

    @Builder.Default
    private String status = "pending";

    private String employerNotes;

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
    
    // Explicit getters and setters
    public Job getJob() {
        return job;
    }
    
    public Profile getStudent() {
        return student;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public void setEmployerNotes(String employerNotes) {
        this.employerNotes = employerNotes;
    }
} 