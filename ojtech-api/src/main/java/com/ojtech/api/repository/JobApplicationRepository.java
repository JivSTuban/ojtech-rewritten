package com.ojtech.api.repository;

import com.ojtech.api.model.CV;
import com.ojtech.api.model.Job;
import com.ojtech.api.model.JobApplication;
import com.ojtech.api.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    
    List<JobApplication> findByStudent(Profile student);
    
    List<JobApplication> findByJob(Job job);
    
    List<JobApplication> findByCv(CV cv);
    
    List<JobApplication> findByStatus(String status);
    
    List<JobApplication> findByJobAndStatus(Job job, String status);
    
    List<JobApplication> findByStudentAndStatus(Profile student, String status);
    
    Optional<JobApplication> findByJobAndStudent(Job job, Profile student);
    
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.job = ?1")
    Long countByJob(Job job);
    
    @Query("SELECT ja FROM JobApplication ja WHERE ja.job.employer = ?1")
    List<JobApplication> findByEmployer(Profile employer);
    
    @Query("SELECT ja FROM JobApplication ja WHERE ja.job.employer = ?1 AND ja.status = ?2")
    List<JobApplication> findByEmployerAndStatus(Profile employer, String status);
} 