package com.ojtech.api.service;

import com.ojtech.api.model.EmployerProfile;
import com.ojtech.api.model.Job;
import com.ojtech.api.model.JobStatus;
import com.ojtech.api.model.JobType;
import com.ojtech.api.model.Profile;
import com.ojtech.api.model.User;
import com.ojtech.api.payload.request.JobRequest;
import com.ojtech.api.payload.response.JobDetailResponse;
import com.ojtech.api.repository.EmployerProfileRepository;
import com.ojtech.api.repository.JobRepository;
import com.ojtech.api.repository.ProfileRepository;
import com.ojtech.api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobServiceImpl implements JobService {

    private static final Logger log = LoggerFactory.getLogger(JobServiceImpl.class);

    private final JobRepository jobRepository;
    private final ProfileRepository profileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final UserRepository userRepository;
    private final JobMatchingService jobMatchingService;

    public JobServiceImpl(JobRepository jobRepository,
                          ProfileRepository profileRepository,
                          EmployerProfileRepository employerProfileRepository,
                          UserRepository userRepository,
                          JobMatchingService jobMatchingService) {
        this.jobRepository = jobRepository;
        this.profileRepository = profileRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.userRepository = userRepository;
        this.jobMatchingService = jobMatchingService;
    }

    @Override
    public Page<Job> getAllPublicJobs(Pageable pageable) {
        log.debug("Fetching all public (active) jobs with pagination: {}", pageable);
        return jobRepository.findByIsActiveTrue(pageable);
    }

    @Override
    public Optional<JobDetailResponse> getPublicJobDetails(UUID jobId) {
        log.debug("Fetching public job details for job ID: {}", jobId);
        return jobRepository.findByIdAndIsActiveTrue(jobId)
                .map(this::convertToJobDetailResponse);
    }

    private JobDetailResponse convertToJobDetailResponse(Job job) {
        EmployerProfile employerProfile = null;
        if (job.getEmployer() != null && job.getEmployer().getProfile() != null) {
            // Assuming User has a Profile, and Profile has an ID which can be used to fetch EmployerProfile
            Optional<EmployerProfile> empProfileOpt = employerProfileRepository.findByProfile_Id(job.getEmployer().getProfile().getId());
            if (empProfileOpt.isPresent()) {
                employerProfile = empProfileOpt.get();
            } else {
                log.warn("EmployerProfile not found for user {} associated with job {}", job.getEmployer().getEmail(), job.getId());
            }
        } else {
             log.warn("Job {} has no employer or employer profile information.", job.getId());
        }

        // Use the constructor that takes Job and EmployerProfile
        return new JobDetailResponse(job, employerProfile);
    }
    
    @Override
    public Page<Job> getJobsByEmployerProfile(UUID employerProfileId, Pageable pageable) {
        log.debug("Fetching jobs for employer profile ID: {} with pagination: {}", employerProfileId, pageable);
        // Find User linked to this EmployerProfile's base Profile
        EmployerProfile employerProfile = employerProfileRepository.findById(employerProfileId)
            .orElseThrow(() -> new RuntimeException("EmployerProfile not found with id: " + employerProfileId));
        
        if (employerProfile.getProfile() == null || employerProfile.getProfile().getUser() == null) {
            throw new RuntimeException("EmployerProfile with id " + employerProfileId + " is not linked to a User.");
        }
        User employerUser = employerProfile.getProfile().getUser();
        return jobRepository.findByEmployer(employerUser, pageable);
    }

    @Override
    public Optional<Job> getJobByEmployerProfileAndId(UUID employerProfileId, UUID jobId) {
        log.debug("Fetching job ID: {} for employer profile ID: {}", jobId, employerProfileId);
         EmployerProfile employerProfile = employerProfileRepository.findById(employerProfileId)
            .orElseThrow(() -> new RuntimeException("EmployerProfile not found with id: " + employerProfileId));
        if (employerProfile.getProfile() == null || employerProfile.getProfile().getUser() == null) {
            throw new RuntimeException("EmployerProfile with id " + employerProfileId + " is not linked to a User.");
        }
        User employerUser = employerProfile.getProfile().getUser();
        return jobRepository.findByIdAndEmployer(jobId, employerUser);
    }

    @Override
    public Job createJobForEmployer(JobRequest jobRequest, UUID employerProfileId) {
        log.info("Creating job for employer profile ID: {}. Request: {}", employerProfileId, jobRequest.getTitle());
        
        EmployerProfile employerProfile = employerProfileRepository.findById(employerProfileId)
            .orElseThrow(() -> new RuntimeException("EmployerProfile not found with id: " + employerProfileId));

        if (employerProfile.getProfile() == null) {
             throw new RuntimeException("EmployerProfile " + employerProfileId + " is not properly linked to a user account.");
        }
        Profile profileEntity = employerProfile.getProfile();

        Job job = Job.builder()
                .title(jobRequest.getTitle())
                .description(jobRequest.getDescription())
                .location(jobRequest.getLocation())
                .jobType(jobRequest.getJobType())
                .salaryRange(jobRequest.getSalaryRange())
                .skillsRequired(jobRequest.getSkillsRequired())
                .closingDate(jobRequest.getClosingDate())
                .employer(profileEntity) // Link to the Profile entity
                .isActive(jobRequest.getIsActive() != null ? jobRequest.getIsActive() : true)
                // postedDate and createdAt/updatedAt are handled by @PrePersist/@PreUpdate in Job model
                .build();
        
        Job savedJob = jobRepository.save(job);
        log.info("Job created successfully with ID: {} for employer profile ID: {}", savedJob.getId(), employerProfileId);
        
        try {
            if (jobMatchingService != null) { // Check if service is available
                jobMatchingService.calculateMatchesForJob(savedJob);
            }
        } catch (Exception e) {
            log.error("Error calculating matches for new job ID {}: {}", savedJob.getId(), e.getMessage(), e);
            // Do not fail job creation if matching fails
        }
        return savedJob;
    }

    @Override
    public Job updateJobForEmployer(UUID jobId, JobRequest jobRequest, UUID employerProfileId) {
        log.info("Updating job ID: {} for employer profile ID: {}. Request: {}", jobId, employerProfileId, jobRequest.getTitle());

        EmployerProfile employerProfile = employerProfileRepository.findById(employerProfileId)
            .orElseThrow(() -> new RuntimeException("EmployerProfile not found with id: " + employerProfileId));
         if (employerProfile.getProfile() == null || employerProfile.getProfile().getUser() == null) {
             throw new RuntimeException("EmployerProfile " + employerProfileId + " is not properly linked to a user account.");
        }
        User employerUser = employerProfile.getProfile().getUser();

        Job job = jobRepository.findByIdAndEmployer(jobId, employerUser)
                .orElseThrow(() -> new AccessDeniedException("Job not found with id " + jobId + " for this employer, or you do not have permission."));

        job.setTitle(jobRequest.getTitle());
        job.setDescription(jobRequest.getDescription());
        job.setLocation(jobRequest.getLocation());
        job.setJobType(jobRequest.getJobType());
        job.setSalaryRange(jobRequest.getSalaryRange());
        job.setSkillsRequired(jobRequest.getSkillsRequired());
        job.setClosingDate(jobRequest.getClosingDate());
        if (jobRequest.getIsActive() != null) {
            job.setActive(jobRequest.getIsActive());
        }
        // Employer (User) is not changed

        Job updatedJob = jobRepository.save(job);
        log.info("Job updated successfully with ID: {}", updatedJob.getId());

        try {
             if (jobMatchingService != null) {
                jobMatchingService.calculateMatchesForJob(updatedJob);
            }
        } catch (Exception e) {
            log.error("Error calculating matches for updated job ID {}: {}", updatedJob.getId(), e.getMessage(), e);
        }
        return updatedJob;
    }

    @Override
    public Job updateJobActiveStatus(UUID jobId, boolean isActive, UUID employerProfileId) {
        log.info("Updating active status to {} for job ID: {}, employer profile ID: {}", isActive, jobId, employerProfileId);
        EmployerProfile employerProfile = employerProfileRepository.findById(employerProfileId)
            .orElseThrow(() -> new RuntimeException("EmployerProfile not found with id: " + employerProfileId));
        if (employerProfile.getProfile() == null || employerProfile.getProfile().getUser() == null) {
             throw new RuntimeException("EmployerProfile " + employerProfileId + " is not properly linked to a user account.");
        }
        User employerUser = employerProfile.getProfile().getUser();
        
        Job job = jobRepository.findByIdAndEmployer(jobId, employerUser)
                .orElseThrow(() -> new AccessDeniedException("Job not found with id " + jobId + " for this employer, or you do not have permission."));
        
        job.setActive(isActive);
        Job savedJob = jobRepository.save(job);
        log.info("Active status updated for job ID: {}", jobId);
        return savedJob;
    }

    @Override
    public void deleteJobForEmployer(UUID jobId, UUID employerProfileId) {
        log.info("Deleting job ID: {} for employer profile ID: {}", jobId, employerProfileId);
        EmployerProfile employerProfile = employerProfileRepository.findById(employerProfileId)
            .orElseThrow(() -> new RuntimeException("EmployerProfile not found with id: " + employerProfileId));
        
        if (employerProfile.getProfile() == null || employerProfile.getProfile().getUser() == null) {
             throw new RuntimeException("EmployerProfile " + employerProfileId + " is not properly linked to a user account.");
        }
        User employerUser = employerProfile.getProfile().getUser();

        Job job = jobRepository.findByIdAndEmployer(jobId, employerUser)
                .orElseThrow(() -> new AccessDeniedException("Job not found with id " + jobId + " for this employer, or you do not have permission to delete."));
        
        // Consider soft delete (job.setActive(false); jobRepository.save(job);)
        // For now, performing hard delete
        jobRepository.delete(job);
        log.info("Job deleted successfully with ID: {}", jobId);
    }
    
    @Override
    public Page<Job> searchAllJobs(String query, String location, String jobType, String status, Pageable pageable) {
        log.debug("Searching all jobs with query: '{}', location: '{}', jobType: '{}', status: '{}', pageable: {}", 
                  query, location, jobType, status, pageable);
        // This requires a custom query in JobRepository or using Specifications/QueryDSL
        // For simplicity, let's assume JobRepository has a method for this.
        // If status is provided, it should be converted to JobStatus enum
        JobStatus jobStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                jobStatus = JobStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid job status provided for search: {}", status);
                // Optionally, throw an error or ignore the status filter
            }
        }
        return jobRepository.searchJobs(query, location, jobType, jobStatus, pageable);
    }
} 