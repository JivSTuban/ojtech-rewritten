package com.ojtech.api.repository;

import com.ojtech.api.model.CV;
import com.ojtech.api.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CVRepository extends JpaRepository<CV, UUID> {
    
    List<CV> findByUser(Profile user);
    
    List<CV> findByUserAndIsActive(Profile user, boolean isActive);
    
    Optional<CV> findByUserAndIsActiveTrue(Profile user);
    
    int countByUser(Profile user);
    
    @Query("SELECT MAX(c.version) FROM CV c WHERE c.user = ?1")
    Integer findMaxVersionByUser(Profile user);
    
    List<CV> findByStatus(String status);
} 