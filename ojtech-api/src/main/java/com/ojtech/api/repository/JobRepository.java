package com.ojtech.api.repository;

import com.ojtech.api.model.Job;
import com.ojtech.api.model.JobStatus;
import com.ojtech.api.model.JobType;
import com.ojtech.api.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    
    List<Job> findByEmployer(Profile employer);
    
    List<Job> findByStatus(JobStatus status);
    
    List<Job> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
    
    List<Job> findByLocationContainingIgnoreCase(String location);
    
    List<Job> findByJobType(JobType jobType);
    
    List<Job> findByApplicationDeadlineAfter(LocalDateTime date);
    
    @Query("SELECT j FROM Job j WHERE j.status = 'OPEN' AND (j.applicationDeadline IS NULL OR j.applicationDeadline > CURRENT_TIMESTAMP)")
    List<Job> findActiveJobs();
    
    @Query("SELECT j FROM Job j WHERE j.employer = ?1 AND j.status = ?2")
    List<Job> findByEmployerAndStatus(Profile employer, JobStatus status);

    List<Job> findByTitleContainingOrDescriptionContainingAllIgnoreCase(String titleTerm, String descriptionTerm);
} 