package com.ojtech.api.repository;

import com.ojtech.api.model.Job;
import com.ojtech.api.model.JobStatus;
import com.ojtech.api.model.JobType;
import com.ojtech.api.model.Profile;
import com.ojtech.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    
    List<Job> findByEmployer(User employer);
    
    List<Job> findByStatus(JobStatus status);
    
    // String-based status finder for compatibility
    @Query("SELECT j FROM Job j WHERE LOWER(j.jobType) = LOWER(:status)")
    List<Job> findByStatus(@Param("status") String status);
    
    List<Job> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
    
    List<Job> findByLocationContainingIgnoreCase(String location);
    
    List<Job> findByJobType(JobType jobType);
    
    List<Job> findByApplicationDeadlineAfter(LocalDateTime date);
    
    @Query("SELECT j FROM Job j WHERE j.status = 'OPEN' AND (j.applicationDeadline IS NULL OR j.applicationDeadline > CURRENT_TIMESTAMP)")
    List<Job> findActiveJobs();
    
    @Query("SELECT j FROM Job j WHERE j.employer = ?1 AND j.status = ?2")
    List<Job> findByEmployerAndStatus(Profile employer, JobStatus status);

    List<Job> findByTitleContainingOrDescriptionContainingAllIgnoreCase(String titleTerm, String descriptionTerm);

    Page<Job> findByEmployer(User employer, Pageable pageable);
    Optional<Job> findByIdAndEmployer(UUID id, User employer);

    // For public job listings (active jobs)
    Page<Job> findByIsActiveTrue(Pageable pageable);
    List<Job> findByIsActiveTrue();
    Optional<Job> findByIdAndIsActiveTrue(UUID id);

    // Example for searching (can be expanded with JpaSpecificationExecutor)
    Page<Job> findByTitleContainingIgnoreCaseAndIsActiveTrue(String title, Pageable pageable);
    Page<Job> findByLocationContainingIgnoreCaseAndIsActiveTrue(String location, Pageable pageable);
    Page<Job> findBySkillsRequiredContainingIgnoreCaseAndIsActiveTrue(String skill, Pageable pageable);

    // New comprehensive search method required by JobServiceImpl
    @Query("SELECT j FROM Job j WHERE j.isActive = true " +
           "AND (:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:jobType IS NULL OR LOWER(j.jobType) LIKE LOWER(CONCAT('%', :jobType, '%'))) " +
           "AND (:status IS NULL OR j.status = :status)") // Assuming Job has a 'status' field of type JobStatus
    Page<Job> searchJobs(@Param("query") String query,
                         @Param("location") String location,
                         @Param("jobType") String jobType, // Consider changing to JobType enum if applicable
                         @Param("status") JobStatus status,
                         Pageable pageable);
} 