package com.ojtech.api.repository;

import com.ojtech.api.model.Employer;
import com.ojtech.api.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployerRepository extends JpaRepository<Employer, UUID> {
    
    Optional<Employer> findByProfile(Profile profile);
    
    Optional<Employer> findByContactEmail(String contactEmail);
    
    List<Employer> findByVerified(boolean verified);
    
    List<Employer> findByCompanyNameContainingIgnoreCase(String companyName);
    
    List<Employer> findByIndustryContainingIgnoreCase(String industry);

    Optional<Employer> findByCompanyName(String companyName);

    List<Employer> findByIndustry(String industry);
} 