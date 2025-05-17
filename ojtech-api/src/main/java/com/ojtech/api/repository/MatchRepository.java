package com.ojtech.api.repository;

import com.ojtech.api.model.Job;
import com.ojtech.api.model.Match;
import com.ojtech.api.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchRepository extends JpaRepository<Match, UUID> {
    
    List<Match> findByStudent(StudentProfile student);
    
    List<Match> findByJob(Job job);
    
    List<Match> findByStudentAndStatus(StudentProfile student, String status);
    
    List<Match> findByJobAndStatus(Job job, String status);
    
    List<Match> findByMatchScoreGreaterThanEqual(BigDecimal minScore);
    
    Optional<Match> findByStudentAndJob(StudentProfile student, Job job);
    
    @Query("SELECT m FROM Match m WHERE m.student = ?1 ORDER BY m.matchScore DESC")
    List<Match> findByStudentOrderByMatchScoreDesc(StudentProfile student);
    
    @Query("SELECT m FROM Match m WHERE m.job = ?1 ORDER BY m.matchScore DESC")
    List<Match> findByJobOrderByMatchScoreDesc(Job job);
    
    @Query("SELECT m FROM Match m WHERE m.job.employer.id = ?1")
    List<Match> findByEmployerId(UUID employerId);
} 