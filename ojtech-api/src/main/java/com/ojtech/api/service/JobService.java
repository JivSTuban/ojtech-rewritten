package com.ojtech.api.service;

import com.ojtech.api.model.Job;
import com.ojtech.api.payload.request.JobRequest;
import com.ojtech.api.payload.response.JobDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobService {

    Page<Job> getAllPublicJobs(Pageable pageable); // Renamed for clarity vs employer's jobs

    Optional<JobDetailResponse> getPublicJobDetails(UUID jobId);

    Page<Job> getJobsByEmployerProfile(UUID employerProfileId, Pageable pageable);

    Optional<Job> getJobByEmployerProfileAndId(UUID employerProfileId, UUID jobId);

    Job createJobForEmployer(JobRequest jobRequest, UUID employerProfileId);

    Job updateJobForEmployer(UUID jobId, JobRequest jobRequest, UUID employerProfileId);
    
    Job updateJobActiveStatus(UUID jobId, boolean isActive, UUID employerProfileId);

    void deleteJobForEmployer(UUID jobId, UUID employerProfileId);
    
    // Method for admin or general job search if needed, distinct from public search
    Page<Job> searchAllJobs(String query, String location, String jobType, String status, Pageable pageable);
}
