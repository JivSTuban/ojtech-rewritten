# Job Matching Service - Quick Reference Guide

## 🎯 Core Principle
**Create matches when NEW jobs or CVs appear. Update matches when existing data changes.**

---

## 📋 Method Reference

### 1️⃣ `createMatchForNewJob(UUID jobId, UUID studentId)`

**Purpose**: Create a single match for a specific job and student

**When to call**:
- ✅ When a NEW job is posted (call for each student with CV)

**When NOT to call**:
- ❌ When updating existing job
- ❌ When student profile changes
- ❌ When CV content is updated

**Returns**: `JobMatch` object or `null` if match already exists

**Example**:
```java
// In JobController when creating a new job
List<StudentProfile> students = studentProfileRepository.findAllWithActiveCVs();
for (StudentProfile student : students) {
    JobMatch match = jobMatchService.createMatchForNewJob(job.getId(), student.getId());
}
```

---

### 2️⃣ `findMatchesForStudent(UUID studentId, Double minScore)`

**Purpose**: Find and create matches for all jobs that don't have matches yet

**When to call**:
- ✅ When a NEW CV is created
- ✅ When a CV is REGENERATED

**When NOT to call**:
- ❌ When updating CV content (use `recalculateMatchesForStudent` instead)
- ❌ When updating student profile (use `recalculateMatchesForStudent` instead)
- ❌ For reading existing matches (use `getStudentMatches` instead)

**Returns**: `List<JobMatch>` (new matches + existing matches if minScore is provided)

**Example**:
```java
// In CVController when generating/regenerating CV
jobMatchService.findMatchesForStudent(student.getId(), null);
```

---

### 3️⃣ `recalculateMatchesForStudent(UUID studentId)`

**Purpose**: Update match scores for ALL existing matches

**When to call**:
- ✅ When CV content is updated
- ✅ When CV HTML is updated
- ✅ When student profile is updated (skills, bio, GitHub, etc.)

**When NOT to call**:
- ❌ When creating a new CV (use `findMatchesForStudent` instead)
- ❌ When a new job is posted
- ❌ For reading matches (use `getStudentMatches` instead)

**Returns**: `void` (updates existing matches in database)

**Example**:
```java
// In CVController when updating CV content
jobMatchService.recalculateMatchesForStudent(cv.getStudent().getId());

// In ProfileUpdateEventService when profile changes (async)
jobMatchService.recalculateMatchesForStudent(studentId);
```

---

### 4️⃣ `getStudentMatches(UUID studentId)`

**Purpose**: Read existing matches (no creation or updates)

**When to call**:
- ✅ When displaying matches to student
- ✅ When fetching matches for UI
- ✅ Any read-only operation

**When NOT to call**:
- ❌ Never - this is always safe to call (read-only)

**Returns**: `List<JobMatch>` with score ≥ 60%

**Example**:
```java
// In JobMatchController when student views their matches
List<JobMatch> matches = jobMatchService.getStudentMatches(studentProfile.getId());
```

---

## 🔍 Decision Table

| Event | Method to Call | Creates New? | Updates Existing? |
|-------|---------------|--------------|-------------------|
| New job posted | `createMatchForNewJob` | ✅ Yes (1 per student) | ❌ No |
| CV created | `findMatchesForStudent` | ✅ Yes (for unmatched jobs) | ❌ No |
| CV regenerated | `findMatchesForStudent` | ✅ Yes (for unmatched jobs) | ❌ No |
| CV content updated | `recalculateMatchesForStudent` | ❌ No | ✅ Yes (all matches) |
| CV HTML updated | `recalculateMatchesForStudent` | ❌ No | ✅ Yes (all matches) |
| Profile updated | `recalculateMatchesForStudent` | ❌ No | ✅ Yes (all matches) |
| View matches | `getStudentMatches` | ❌ No | ❌ No (read-only) |

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T: Call both methods together
```java
// WRONG - Creates matches twice!
jobMatchService.recalculateMatchesForStudent(studentId);
jobMatchService.findMatchesForStudent(studentId, null);
```

### ✅ DO: Choose the right method
```java
// RIGHT - CV regenerated? Only find new matches
jobMatchService.findMatchesForStudent(studentId, null);

// RIGHT - CV content updated? Only recalculate existing
jobMatchService.recalculateMatchesForStudent(studentId);
```

---

### ❌ DON'T: Use findMatchesForStudent for updates
```java
// WRONG - This will skip existing matches, not update them
jobMatchService.findMatchesForStudent(studentId, null); // When CV content changes
```

### ✅ DO: Use recalculateMatchesForStudent for updates
```java
// RIGHT - This updates all existing matches
jobMatchService.recalculateMatchesForStudent(studentId); // When CV content changes
```

---

### ❌ DON'T: Call findMatchesForStudent after every profile change
```java
// WRONG - Creates unnecessary matches
public void updateProfile(StudentProfile profile) {
    studentProfileRepository.save(profile);
    jobMatchService.findMatchesForStudent(profile.getId(), null); // BAD!
}
```

### ✅ DO: Call recalculateMatchesForStudent for profile changes
```java
// RIGHT - Updates existing match scores
public void updateProfile(StudentProfile profile) {
    studentProfileRepository.save(profile);
    profileUpdateEventService.recalculateJobMatches(profile.getId()); // GOOD!
}
```

---

## 📊 Performance Characteristics

| Method | DB Queries | AI Calls | Best For |
|--------|-----------|----------|----------|
| `createMatchForNewJob` | 3-5 | 5-8 per match | Single job, many students |
| `findMatchesForStudent` | 2 + 1 per new job | 5-8 per new job | Single student, many jobs |
| `recalculateMatchesForStudent` | 2 + 1 per match | 1-2 per match | Update existing matches |
| `getStudentMatches` | 1 | 0 | Read-only operations |

---

## 🚀 Usage Examples by File

### JobController.java
```java
@PostMapping
public ResponseEntity<?> createJob(@RequestBody Map<String, Object> jobData) {
    // ... create and save job ...
    
    // Create matches for this new job
    List<StudentProfile> students = studentProfileRepository.findAllWithActiveCVs();
    for (StudentProfile student : students) {
        jobMatchService.createMatchForNewJob(job.getId(), student.getId());
    }
    
    return ResponseEntity.ok(job);
}
```

### CVController.java
```java
@PostMapping("/generate")
public ResponseEntity<CV> generateCVFromProfile() {
    // ... create/update CV ...
    
    // CV regenerated - find matches for new jobs
    jobMatchService.findMatchesForStudent(student.getId(), null);
    
    return ResponseEntity.ok(cv);
}

@PutMapping("/{id}/content")
public ResponseEntity<CV> updateCVContent(@PathVariable UUID id, @RequestBody String content) {
    // ... update CV content ...
    
    // Content updated - recalculate existing matches
    jobMatchService.recalculateMatchesForStudent(cv.getStudent().getId());
    
    return ResponseEntity.ok(cv);
}
```

### ProfileUpdateEventService.java
```java
@Async
public void handleProfileUpdate(UUID userId, UUID studentId) {
    // Profile updated - recalculate existing matches
    jobMatchService.recalculateMatchesForStudent(studentId);
}
```

### JobMatchController.java
```java
@GetMapping("/student/job-matches")
public ResponseEntity<?> getStudentJobMatches(@CurrentUser UserPrincipal currentUser) {
    StudentProfile student = studentProfileRepository.findByUserId(currentUser.getId())
        .orElseThrow(() -> new RuntimeException("Student not found"));
    
    // Just reading - use getStudentMatches
    List<JobMatch> matches = jobMatchService.getStudentMatches(student.getId());
    
    return ResponseEntity.ok(matches);
}
```

---

## 🐛 Debugging Checklist

If matches aren't being created/updated:

1. **Check logs** for method calls:
   - "New job posted: ..." → Should see `createMatchForNewJob`
   - "CV regenerated - triggering job matching..." → Should see `findMatchesForStudent`
   - "CV content updated - recalculating..." → Should see `recalculateMatchesForStudent`

2. **Verify method is correct** for the event:
   - New entity (job/CV)? → Create matches
   - Existing entity updated? → Recalculate matches

3. **Check database**:
   ```sql
   SELECT COUNT(*) FROM job_match WHERE student_id = ?;
   SELECT * FROM job_match WHERE job_id = ? AND student_id = ?;
   ```

4. **Verify no duplicates**:
   - `createMatchForNewJob` should return `null` if match exists
   - Check logs for "Match already exists for job..."

5. **Check AI API key**:
   - If scores aren't being calculated, check `gemini.api.key` in properties

---

## 📝 Summary

**Remember the golden rule:**
- **NEW** job or CV → **CREATE** matches (`createMatchForNewJob` or `findMatchesForStudent`)
- **UPDATED** content → **RECALCULATE** matches (`recalculateMatchesForStudent`)
- **READ** matches → **GET** matches (`getStudentMatches`)

**One method per event. No combinations.**




