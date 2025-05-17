package com.ojtech.api.service;

import com.ojtech.api.model.Job;
import com.ojtech.api.model.JobStatus;
import com.ojtech.api.model.JobType;
import com.ojtech.api.model.Profile;
import com.ojtech.api.repository.JobRepository;
import com.ojtech.api.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class JobServiceImpl implements JobService {

    private static final Logger log = LoggerFactory.getLogger(JobServiceImpl.class);

    private final JobRepository jobRepository;
    private final ProfileRepository profileRepository;
    private final JobMatchingService jobMatchingService;

    public JobServiceImpl(JobRepository jobRepository, ProfileRepository profileRepository, JobMatchingService jobMatchingService) {
        this.jobRepository = jobRepository;
        this.profileRepository = profileRepository;
        this.jobMatchingService = jobMatchingService;
    }

    @Override
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @Override
    public Optional<Job> getJobById(UUID id) {
        return jobRepository.findById(id);
    }

    @Override
    public List<Job> getJobsByEmployer(UUID employerId) {
        return profileRepository.findById(employerId)
                .map(jobRepository::findByEmployer)
                .orElseThrow(() -> new RuntimeException("Employer not found with id: " + employerId));
    }

    @Override
    public List<Job> getJobsByStatus(String status) {
        try {
            JobStatus jobStatus = JobStatus.valueOf(status.toUpperCase());
            return jobRepository.findByStatus(jobStatus);
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    @Override
    public List<Job> searchJobs(String query) {
        return jobRepository.findByTitleContainingOrDescriptionContainingAllIgnoreCase(query, query);
    }

    @Override
    public List<Job> getJobsByLocation(String location) {
        return jobRepository.findByLocationContainingIgnoreCase(location);
    }

    @Override
    public List<Job> getJobsByJobType(String jobType) {
        try {
            JobType type = JobType.valueOf(jobType.toUpperCase());
            return jobRepository.findByJobType(type);
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    @Override
    public List<Job> getActiveJobs() {
        return jobRepository.findActiveJobs();
    }

    @Override
    public Job createJob(Job job) {
        
        // Ensure the employer profile exists
        if (job.getEmployer() != null && job.getEmployer().getId() != null) {
            Profile employer = profileRepository.findById(job.getEmployer().getId())
                    .orElseThrow(() -> new RuntimeException("Employer profile not found with id: " + 
                            job.getEmployer().getId()));
            
            job.setEmployer(employer);
        }
        
        Job savedJob = jobRepository.save(job);
        
        // Generate matches for this job
        try {
            jobMatchingService.calculateMatchesForJob(savedJob);
        } catch (Exception e) {
            // We don't want to fail the job creation if matching fails
        }
        
        return savedJob;
    }

    @Override
    public Job updateJob(UUID id, Job jobDetails) {
        
        return jobRepository.findById(id)
                .map(existingJob -> {
                    // Update fields but keep the same employer reference
                    Profile employer = existingJob.getEmployer();
                    
                    existingJob.setTitle(jobDetails.getTitle());
                    existingJob.setDescription(jobDetails.getDescription());
                    existingJob.setCompanyName(jobDetails.getCompanyName());
                    existingJob.setCompanyLogoUrl(jobDetails.getCompanyLogoUrl());
                    existingJob.setLocation(jobDetails.getLocation());
                    existingJob.setJobType(jobDetails.getJobType());
                    existingJob.setSalaryRange(jobDetails.getSalaryRange());
                    existingJob.setApplicationDeadline(jobDetails.getApplicationDeadline());
                    existingJob.setRequiredSkills(jobDetails.getRequiredSkills());
                    existingJob.setPreferredSkills(jobDetails.getPreferredSkills());
                    
                    // Keep the original employer reference
                    existingJob.setEmployer(employer);
                    
                    Job updatedJob = jobRepository.save(existingJob);
                    
                    // Recalculate matches for updated job
                    try {
                        jobMatchingService.calculateMatchesForJob(updatedJob);
                    } catch (Exception e) {
                    }
                    
                    return updatedJob;
                })
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    @Override
    public Job updateJobStatus(UUID id, String status) {
        
        try {
            JobStatus jobStatus = JobStatus.valueOf(status.toUpperCase());
            
            return jobRepository.findById(id)
                    .map(job -> {
                        job.setStatus(jobStatus);
                        return jobRepository.save(job);
                    })
                    .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid job status: " + status);
        }
    }

    @Override
    public void deleteJob(UUID id) {
        
        if (!jobRepository.existsById(id)) {
            throw new RuntimeException("Job not found with id: " + id);
        }
        
        jobRepository.deleteById(id);
    }
} 