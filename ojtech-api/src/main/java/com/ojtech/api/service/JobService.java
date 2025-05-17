package com.ojtech.api.service;

import com.ojtech.api.model.Job;
import com.ojtech.api.model.JobStatus;
import com.ojtech.api.model.JobType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobService {
    List<Job> getAllJobs();
    Optional<Job> getJobById(UUID id);
    List<Job> getJobsByEmployer(UUID employerId);
    List<Job> getJobsByStatus(String status);
    List<Job> searchJobs(String query);
    List<Job> getJobsByLocation(String location);
    List<Job> getJobsByJobType(String jobType);
    List<Job> getActiveJobs();
    Job createJob(Job job);
    Job updateJob(UUID id, Job job);
    Job updateJobStatus(UUID id, String status);
    void deleteJob(UUID id);
} 