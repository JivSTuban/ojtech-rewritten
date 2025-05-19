package com.ojtech.api.repository;

import com.ojtech.api.model.CV;
import com.ojtech.api.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CVRepository extends JpaRepository<CV, UUID> {
    List<CV> findByProfile(Profile profile);
    Optional<CV> findByProfileAndIsActiveTrue(Profile profile);
    List<CV> findByProfileAndIsActiveFalse(Profile profile);
    
    // Additional methods needed for CVServiceImpl
    // Alias methods for compatibility
    default List<CV> findByUser(Profile user) {
        return findByProfile(user);
    }
    
    default List<CV> findByUserAndIsActive(Profile user, boolean isActive) {
        return isActive ? 
            findByProfileAndIsActiveTrue(user).map(List::of).orElse(List.of()) : 
            findByProfileAndIsActiveFalse(user);
    }
    
    @Query("SELECT COALESCE(MAX(c.version), 0) FROM CV c WHERE c.profile = :profile")
    Integer findMaxVersionByUser(@Param("profile") Profile profile);
}
