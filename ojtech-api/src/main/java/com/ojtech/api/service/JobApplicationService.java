package com.ojtech.api.service;

import com.ojtech.api.model.JobApplication;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobApplicationService {
    JobApplication createJobApplication(JobApplication jobApplication);
    Optional<JobApplication> getApplicationById(UUID id);
    List<JobApplication> getApplicationsByStudent(UUID studentId);
    List<JobApplication> getApplicationsByJob(UUID jobId);
    Optional<JobApplication> updateApplicationStatus(UUID id, String status);
    Optional<JobApplication> updateEmployerNotes(UUID id, String notes);
    void deleteApplication(UUID id);
} 