package com.ojtech.api.service;

import com.ojtech.api.model.CV;
import com.ojtech.api.model.Job;
import com.ojtech.api.model.Match;
import com.ojtech.api.model.StudentProfile;

import java.util.List;
import java.util.UUID;

public interface JobMatchingService {
    void calculateMatchesForCV(CV cv);
    void calculateMatchesForJob(Job job);
    List<Match> getMatchesForStudent(UUID studentId);
    List<Match> getMatchesForJob(UUID jobId);
    Match getMatchById(UUID matchId);
    void updateMatchStatus(UUID matchId, String status);
    void deleteMatch(UUID matchId);
    double calculateAiMatchScore(CV cv, Job job);
} 