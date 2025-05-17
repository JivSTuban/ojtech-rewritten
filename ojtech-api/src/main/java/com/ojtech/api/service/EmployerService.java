package com.ojtech.api.service;

import com.ojtech.api.model.Employer;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployerService {
    List<Employer> getAllEmployers();
    Optional<Employer> getEmployerById(UUID id);
    Optional<Employer> getEmployerByProfileId(UUID profileId);
    List<Employer> getEmployersByVerificationStatus(boolean verified);
    List<Employer> getEmployersByIndustry(String industry);
    Employer createEmployer(Employer employer);
    Employer updateEmployer(UUID id, Employer employer);
    Employer updateVerificationStatus(UUID id, boolean verified);
    void deleteEmployer(UUID id);
} 