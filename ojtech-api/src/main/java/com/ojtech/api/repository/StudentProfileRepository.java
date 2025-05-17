package com.ojtech.api.repository;

import com.ojtech.api.model.Profile;
import com.ojtech.api.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {
    
    Optional<StudentProfile> findByProfile(Profile profile);
    
    Optional<StudentProfile> findBySchoolEmail(String schoolEmail);
    
    Optional<StudentProfile> findByPersonalEmail(String personalEmail);
    
    boolean existsBySchoolEmail(String schoolEmail);
    
    boolean existsByPersonalEmail(String personalEmail);
} 