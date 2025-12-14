# Job Matching Flow Diagram

## Trigger Events and Actions

```
┌─────────────────────────────────────────────────────────────────────┐
│                     JOB MATCHING TRIGGER EVENTS                      │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  NEW JOB POSTED      │
│  (by NLO/Employer)   │
└──────────┬───────────┘
           │
           ▼
    ╔══════════════════════════════════════════╗
    ║  JobController.createJob()               ║
    ║  → Save new job to database              ║
    ║  → Set active = true                     ║
    ╚═══════════════════╤══════════════════════╝
                        │
                        ▼
          ┌─────────────────────────────┐
          │ Get all students with CVs   │
          └─────────────┬───────────────┘
                        │
                        ▼
          ┌─────────────────────────────────────────────┐
          │  FOR EACH STUDENT:                          │
          │  jobMatchService.createMatchForNewJob()     │
          │    ├─ Check: Match already exists?          │
          │    │   └─ YES → Return null (skip)          │
          │    │   └─ NO  → Continue ↓                  │
          │    ├─ Analyze GitHub projects               │
          │    ├─ Analyze portfolio                     │
          │    ├─ Analyze certifications                │
          │    ├─ Analyze work experience               │
          │    ├─ Analyze bio (NLP)                     │
          │    ├─ Calculate match score (AI)            │
          │    └─ Save match to database                │
          └─────────────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │  Log results    │
              │  Return success │
              └─────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│  CV GENERATED/REGENERATED (by Student)                               │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
                ╔═══════════════════════════════════════════╗
                ║  CVController.generateCVFromProfile()     ║
                ║  → Create or update CV                    ║
                ║  → Set active = true, generated = true    ║
                ╚═══════════════╤═══════════════════════════╝
                                │
                                ▼
              ┌─────────────────────────────────────────┐
              │ jobMatchService.findMatchesForStudent() │
              │   ├─ Get all active jobs                │
              │   ├─ Get existing matches               │
              │   ├─ Identify jobs WITHOUT matches      │
              │   └─ FOR EACH unmatched job:            │
              │       ├─ Analyze (GitHub, portfolio...) │
              │       ├─ Calculate match score (AI)     │
              │       └─ Save new match                 │
              └─────────────────────────────────────────┘
                                │
                                ▼
                      ┌─────────────────┐
                      │  Log results    │
                      │  Return all     │
                      │  matches        │
                      └─────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│  CV CONTENT UPDATED (by Student)                                     │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
                ╔═══════════════════════════════════════╗
                ║  CVController.updateCVContent()       ║
                ║  → Update CV.parsedResume             ║
                ║  → Update lastUpdated timestamp       ║
                ╚═══════════════╤═══════════════════════╝
                                │
                                ▼
          ┌──────────────────────────────────────────────┐
          │ jobMatchService.recalculateMatchesForStudent()│
          │   ├─ Get EXISTING matches only               │
          │   ├─ FOR EACH existing match:                │
          │   │   ├─ Re-analyze with updated CV          │
          │   │   ├─ Recalculate match score (AI)        │
          │   │   └─ Update match in database            │
          │   └─ NO new matches created                  │
          └──────────────────────────────────────────────┘
                                │
                                ▼
                      ┌─────────────────┐
                      │  Log results    │
                      │  Return updated │
                      │  CV             │
                      └─────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│  PROFILE UPDATED (by Student)                                        │
│  (skills, bio, GitHub, portfolio, certs, experience)                 │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
                ╔═══════════════════════════════════════╗
                ║  ProfileController.updateProfile()    ║
                ║  → Update student profile fields      ║
                ║  → Save to database                   ║
                ╚═══════════════╤═══════════════════════╝
                                │
                                ▼
          ┌─────────────────────────────────────────────┐
          │ ProfileUpdateEventService (ASYNC)           │
          │   └─ recalculateJobMatches()                │
          └─────────────────┬───────────────────────────┘
                            │
                            ▼
          ┌──────────────────────────────────────────────┐
          │ jobMatchService.recalculateMatchesForStudent()│
          │   ├─ Get EXISTING matches only               │
          │   ├─ FOR EACH existing match:                │
          │   │   ├─ Re-analyze with updated profile     │
          │   │   ├─ Recalculate match score (AI)        │
          │   │   └─ Update match in database            │
          │   └─ NO new matches created                  │
          └──────────────────────────────────────────────┘
                                │
                                ▼
                      ┌─────────────────┐
                      │  Log results    │
                      │  Background task│
                      │  completes      │
                      └─────────────────┘
```

## Decision Tree: Which Method to Call?

```
                    ┌─────────────────────────┐
                    │  Matching Event Occurs  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ What triggered it?      │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ NEW JOB        │    │ NEW/REGEN CV     │    │ UPDATE CV/      │
│ POSTED?        │    │                  │    │ PROFILE?        │
└────────┬───────┘    └────────┬─────────┘    └─────────┬───────┘
         │                     │                         │
         │ YES                 │ YES                     │ YES
         ▼                     ▼                         ▼
┌─────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ createMatchForNewJob│ │findMatchesForStudent│ │recalculateMatches  │
│ (for each student)  │ │ (for all jobs)      │ │ForStudent          │
└─────────┬───────────┘ └──────────┬─────────┘ └──────────┬─────────┘
          │                        │                       │
          ▼                        ▼                       ▼
┌─────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ • Check duplicate   │ │ • Skip jobs with   │ │ • Get EXISTING     │
│ • Create 1 match    │ │   existing matches │ │   matches only     │
│ • For 1 job only    │ │ • Create NEW       │ │ • Update scores    │
│                     │ │   matches          │ │ • No new matches   │
└─────────────────────┘ └────────────────────┘ └────────────────────┘
```

## Method Comparison

```
┌──────────────────────────────────────────────────────────────────────┐
│ METHOD                    │ WHEN TO USE          │ WHAT IT DOES      │
├──────────────────────────────────────────────────────────────────────┤
│ createMatchForNewJob()    │ • New job posted     │ • Creates 1 match │
│                           │ • For all students   │ • Checks duplicate│
│                           │   with CVs           │ • Fast & targeted │
├──────────────────────────────────────────────────────────────────────┤
│ findMatchesForStudent()   │ • New CV created     │ • Creates N       │
│                           │ • CV regenerated     │   matches         │
│                           │ • For all unmatched  │ • Skips existing  │
│                           │   jobs               │ • Batch operation │
├──────────────────────────────────────────────────────────────────────┤
│ recalculateMatchesFor     │ • Profile updated    │ • Updates M       │
│ Student()                 │ • CV content updated │   existing matches│
│                           │ • CV HTML updated    │ • No new matches  │
│                           │                      │ • Preserves data  │
└──────────────────────────────────────────────────────────────────────┘
```

## Duplicate Prevention Flow

```
     ┌──────────────────────────────────┐
     │ Matching Request Received        │
     └─────────────┬────────────────────┘
                   │
                   ▼
     ┌──────────────────────────────────┐
     │ Check Database:                  │
     │ existsByJobIdAndStudentId()      │
     └─────────────┬────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼ NO                ▼ YES
┌────────────────┐  ┌──────────────────┐
│ Proceed with   │  │ Skip creation    │
│ match creation │  │ Return null      │
│ (Full analysis)│  │ Log "duplicate"  │
└────────────────┘  └──────────────────┘
         │
         ▼
┌────────────────────────┐
│ AI Analysis & Scoring  │
│ • GitHub               │
│ • Portfolio            │
│ • Certifications       │
│ • Work Experience      │
│ • Bio NLP              │
│ • Match Score          │
└────────────┬───────────┘
             │
             ▼
┌────────────────────────┐
│ Save to Database       │
│ Return JobMatch object │
└────────────────────────┘
```

## Summary of Changes

### ✅ BEFORE (Problematic)
```
NEW JOB:
  findMatchesForStudent() × N students
  → Creates matches for ALL jobs (even existing ones)
  → Wasteful: O(N × M) checks

CV REGENERATED:
  recalculateMatchesForStudent() → Updates E matches
  + findMatchesForStudent()      → Creates K new matches
  → Redundant: Double AI calls for each job

CV CONTENT UPDATED:
  recalculateMatchesForStudent() → Updates E matches
  + findMatchesForStudent()      → Creates K new matches
  → Wasteful: Should only update, not create
```

### ✅ AFTER (Optimized)
```
NEW JOB:
  createMatchForNewJob() × N students
  → Creates 1 match per student
  → Efficient: O(N) with duplicate check

CV REGENERATED:
  findMatchesForStudent()
  → Creates only NEW matches
  → Efficient: Only necessary AI calls

CV CONTENT UPDATED:
  recalculateMatchesForStudent()
  → Updates only EXISTING matches
  → Efficient: No unnecessary creation
```




