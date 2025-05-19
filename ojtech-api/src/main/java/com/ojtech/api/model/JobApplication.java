package com.ojtech.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.Objects;

@Entity
@Table(name = "job_applications")
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

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    private String status = "pending";

    @Column(columnDefinition = "TEXT")
    private String employerNotes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    public JobApplication() {
        this.status = "pending";
    }

    public JobApplication(UUID id, Job job, Profile student, CV cv, String coverLetter, String status, String employerNotes, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.job = job;
        this.student = student;
        this.cv = cv;
        this.coverLetter = coverLetter;
        this.status = (status != null ? status : "pending");
        this.employerNotes = employerNotes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public Profile getStudent() {
        return student;
    }

    public void setStudent(Profile student) {
        this.student = student;
    }

    public CV getCv() {
        return cv;
    }

    public void setCv(CV cv) {
        this.cv = cv;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEmployerNotes() {
        return employerNotes;
    }

    public void setEmployerNotes(String employerNotes) {
        this.employerNotes = employerNotes;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static JobApplicationBuilder builder() {
        return new JobApplicationBuilder();
    }

    public static class JobApplicationBuilder {
        private UUID id;
        private Job job;
        private Profile student;
        private CV cv;
        private String coverLetter;
        private String status = "pending";
        private String employerNotes;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;

        JobApplicationBuilder() {
        }

        public JobApplicationBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public JobApplicationBuilder job(Job job) {
            this.job = job;
            return this;
        }

        public JobApplicationBuilder student(Profile student) {
            this.student = student;
            return this;
        }

        public JobApplicationBuilder cv(CV cv) {
            this.cv = cv;
            return this;
        }

        public JobApplicationBuilder coverLetter(String coverLetter) {
            this.coverLetter = coverLetter;
            return this;
        }

        public JobApplicationBuilder status(String status) {
            if (status != null) {
                this.status = status;
            }
            return this;
        }

        public JobApplicationBuilder employerNotes(String employerNotes) {
            this.employerNotes = employerNotes;
            return this;
        }

        public JobApplicationBuilder createdAt(OffsetDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public JobApplicationBuilder updatedAt(OffsetDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public JobApplication build() {
            JobApplication app = new JobApplication();
            app.setId(this.id);
            app.setJob(this.job);
            app.setStudent(this.student);
            app.setCv(this.cv);
            app.setCoverLetter(this.coverLetter);
            app.setStatus(this.status);
            app.setEmployerNotes(this.employerNotes);
            if (this.createdAt != null) app.setCreatedAt(this.createdAt);
            if (this.updatedAt != null) app.setUpdatedAt(this.updatedAt); 
            return app;
        }

        public String toString() {
            return "JobApplication.JobApplicationBuilder(id=" + this.id + 
                   ", job=" + (this.job != null ? this.job.getId() : null) + 
                   ", student=" + (this.student != null ? this.student.getId() : null) + 
                   ", cv=" + (this.cv != null ? this.cv.getId() : null) + 
                   ", coverLetter='" + this.coverLetter + "'" + 
                   ", status='" + this.status + "'" + 
                   ", employerNotes='" + this.employerNotes + "'" + 
                   ", createdAt=" + this.createdAt + 
                   ", updatedAt=" + this.updatedAt + 
                   ")";
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        JobApplication that = (JobApplication) o;
        return Objects.equals(id, that.id) &&
               Objects.equals(job != null ? job.getId() : null, that.job != null ? that.job.getId() : null) &&
               Objects.equals(student != null ? student.getId() : null, that.student != null ? that.student.getId() : null) &&
               Objects.equals(cv != null ? cv.getId() : null, that.cv != null ? that.cv.getId() : null) &&
               Objects.equals(coverLetter, that.coverLetter) &&
               Objects.equals(status, that.status) &&
               Objects.equals(employerNotes, that.employerNotes) &&
               Objects.equals(createdAt, that.createdAt) &&
               Objects.equals(updatedAt, that.updatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, 
                            job != null ? job.getId() : null, 
                            student != null ? student.getId() : null, 
                            cv != null ? cv.getId() : null, 
                            coverLetter, status, employerNotes, createdAt, updatedAt);
    }

    @Override
    public String toString() {
        return "JobApplication{" +
               "id=" + id +
               ", jobId=" + (job != null ? job.getId() : null) +
               ", studentId=" + (student != null ? student.getId() : null) +
               ", cvId=" + (cv != null ? cv.getId() : null) +
               ", coverLetter='" + (coverLetter != null ? coverLetter.substring(0, Math.min(coverLetter.length(), 50)) + "..." : "null") + '\'' +
               ", status='" + status + '\'' +
               ", employerNotes='" + (employerNotes != null ? employerNotes.substring(0, Math.min(employerNotes.length(), 50)) + "..." : "null") + '\'' +
               ", createdAt=" + createdAt +
               ", updatedAt=" + updatedAt +
               '}';
    }
} 