package com.ojtech.api.repository;

import com.ojtech.api.model.EmployerProfile;
import com.ojtech.api.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployerProfileRepository extends JpaRepository<EmployerProfile, UUID> {
    Optional<EmployerProfile> findByProfile(Profile profile);
    Optional<EmployerProfile> findByProfile_Id(UUID profileId);
    Optional<EmployerProfile> findByCompanyName(String companyName);
    boolean existsByCompanyName(String companyName);
} 