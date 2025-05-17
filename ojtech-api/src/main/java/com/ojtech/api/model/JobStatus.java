package com.ojtech.api.model;

/**
 * Enum representing the status of a job posting.
 */
public enum JobStatus {
    DRAFT,      // Job is saved but not yet published
    OPEN,       // Job is open for applications
    CLOSED,     // Job is no longer accepting applications
    FILLED,     // Job position has been filled
    EXPIRED,    // Job posting has expired
    CANCELLED   // Job posting was cancelled
} 