package com.ojtech.api.repository;

import com.ojtech.api.model.CV;
import com.ojtech.api.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CVRepository extends JpaRepository<CV, UUID> {
    List<CV> findByProfile(Profile profile);
    Optional<CV> findByProfileAndIsActiveTrue(Profile profile);
    List<CV> findByProfileAndIsActiveFalse(Profile profile);
    // Add any other specific query methods if needed
}
