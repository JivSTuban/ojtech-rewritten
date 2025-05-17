package com.ojtech.api.service;

import com.ojtech.api.model.Job;
import com.ojtech.api.model.JobApplication;
import com.ojtech.api.model.Profile;
import com.ojtech.api.repository.CVRepository;
import com.ojtech.api.repository.JobApplicationRepository;
import com.ojtech.api.repository.JobRepository;
import com.ojtech.api.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class JobApplicationServiceImpl implements JobApplicationService {

    private static final Logger log = LoggerFactory.getLogger(JobApplicationServiceImpl.class);

    private final JobApplicationRepository jobApplicationRepository;
    private final ProfileRepository profileRepository;
    private final JobRepository jobRepository;
    private final CVRepository cvRepository;

    public JobApplicationServiceImpl(JobApplicationRepository jobApplicationRepository,
                                     ProfileRepository profileRepository,
                                     JobRepository jobRepository,
                                     CVRepository cvRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.profileRepository = profileRepository;
        this.jobRepository = jobRepository;
        this.cvRepository = cvRepository;
    }

    @Override
    public JobApplication createJobApplication(JobApplication jobApplication) {
        if (jobApplication.getStudent() == null || jobApplication.getStudent().getId() == null) {
            throw new IllegalArgumentException("Student ID must be provided for job application.");
        }
        if (jobApplication.getJob() == null || jobApplication.getJob().getId() == null) {
            throw new IllegalArgumentException("Job ID must be provided for job application.");
        }

        log.info("Creating job application for student ID: {} and job ID: {}", 
                 jobApplication.getStudent().getId(), jobApplication.getJob().getId());
        return jobApplicationRepository.save(jobApplication);
    }

    @Override
    public Optional<JobApplication> getApplicationById(UUID id) {
        return jobApplicationRepository.findById(id);
    }

    @Override
    public List<JobApplication> getApplicationsByStudent(UUID studentId) {
        Optional<Profile> student = profileRepository.findById(studentId);
        if (student.isEmpty()) {
            return Collections.emptyList();
        }
        return jobApplicationRepository.findByStudent(student.get());
    }

    @Override
    public List<JobApplication> getApplicationsByJob(UUID jobId) {
        Optional<Job> job = jobRepository.findById(jobId);
        if (job.isEmpty()) {
            return Collections.emptyList();
        }
        return jobApplicationRepository.findByJob(job.get());
    }

    @Override
    public Optional<JobApplication> updateApplicationStatus(UUID id, String status) {
        return jobApplicationRepository.findById(id)
                .map(application -> {
                    application.setStatus(status);
                    return jobApplicationRepository.save(application);
                });
    }

    @Override
    public Optional<JobApplication> updateEmployerNotes(UUID id, String notes) {
        return jobApplicationRepository.findById(id)
                .map(application -> {
                    application.setEmployerNotes(notes);
                    return jobApplicationRepository.save(application);
                });
    }

    @Override
    public void deleteApplication(UUID id) {
        jobApplicationRepository.deleteById(id);
    }
} 