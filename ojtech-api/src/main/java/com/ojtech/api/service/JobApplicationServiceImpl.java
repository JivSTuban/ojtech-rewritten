package com.ojtech.api.service;

import com.ojtech.api.model.Job;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.model.JobApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.model.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.CVRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.JobApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service

@Transactional

public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final ProfileRepository profileRepository;
    private final JobRepository jobRepository;
    private final CVRepository cvRepository;

    @Override
    public JobApplication createJobApplication(JobApplication jobApplication) {
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