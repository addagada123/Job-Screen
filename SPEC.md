# JobScreen Pro - Blue Collar Job Screening Platform

## Project Overview

**Project Name:** JobScreen Pro  
**Type:** Full-stack Web Application  
**Core Functionality:** AI-powered screening platform for blue-collar job candidates with resume parsing, voice-enabled assessments, and proctoring features  
**Target Users:** Blue-collar job seekers (plumbers, masons, drivers, electricians, carpenters, etc.) and hiring administrators

---

## UI/UX Specification

### Color Palette

| Role | Color | Hex Code |
|------|-------|----------|
| Primary | Deep Navy | #1a1f2e |
| Secondary | Steel Blue | #2d3a4f |
| Accent | Electric Cyan | #00d4ff |
| Success | Emerald | #10b981 |
| Warning | Amber | #f59e0b |
| Error | Coral Red | #ef4444 |
| Background | Charcoal Black | #0f1218 |
| Surface | Slate | #1e2633 |
| Text Primary | White | #ffffff |
| Text Secondary | Silver | #94a3b8 |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Logo/Brand | 'Orbitron', sans-serif | 28px | 700 |
| Headings | 'Rajdhani', sans-serif | 36-24px | 600-700 |
| Body | 'Exo 2', sans-serif | 16px | 400 |
| Buttons | 'Rajdhani', sans-serif | 16px | 600 |
| Code/Technical | 'JetBrains Mono', monospace | 14px | 400 |

### Layout Structure

**Responsive Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Page Sections:**
1. **Navigation Bar** - Fixed top, glassmorphism effect
2. **Hero Section** - Full viewport height with animated particles
3. **Content Areas** - Card-based layouts with hover effects
4. **Footer** - Minimal with social links

### Visual Effects

- **Glassmorphism:** Background blur (20px), rgba surfaces
- **Neon Glow:** Box shadows with accent colors
- **Animations:** Smooth transitions (0.3s ease), staggered reveals
- **Background:** Animated gradient mesh with floating particles

---

## Pages & Components

### 1. Landing Page
- Hero with animated job seeker illustration
- Feature highlights (Resume Upload, Voice Answer, AI Evaluation)
- Call-to-action buttons for Login/Signup

### 2. Authentication Pages
- **Login:** Email/password with animated inputs
- **Signup:** Multi-step form with job role selection
- Role selection: Job Seeker / Administrator

### 3. User Dashboard
- Profile summary card
- Resume upload section with drag-drop
- Applied jobs list
- Test status indicators
- Performance history chart

### 4. Resume Upload
- Drag-drop zone with file validation
- Supported formats: PDF, DOCX, JPG, PNG
- Skill extraction display
- Job category auto-detection

### 5. Assessment Test Page
- **Proctoring Features:**
  - Fullscreen enforcement button
  - Tab switch counter (visible)
  - Exit warning modal at 3 switches
  - Auto-submit at 5 switches
  
- **Question Display:**
  - Large, readable text (English)
  - Question number and timer
  - Progress bar
  
- **Answer Options:**
  - Voice input button (microphone icon)
  - Text input area
  - Language selector dropdown
  - Submit button

### 6. Admin Dashboard
- **Sidebar Navigation:**
  - Overview
  - Candidates
  - Tests
  - Analytics
  - Settings
  
- **Main Content:**
  - Stats cards (Total Candidates, Tests Taken, Avg Score)
  - Ranked candidate table with sorting
  - Performance charts
  - Search and filter

---

## Functionality Specification

### Core Features

#### 1. User Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Session management
- Role-based access control (User/Admin)

#### 2. Resume Processing
- File upload with size limit (5MB)
- PDF/DOCX text extraction
- Skill keyword extraction using NLP
- Job category classification:
  - Plumbing
  - Masonry
  - Driving
  - Electrical
  - Carpentry
  - Painting
  - General Labor

#### 3. Question Generation
- Job-specific question bank
- Difficulty levels (Basic, Intermediate, Advanced)
- Random question selection

#### 4. Proctoring System
- Fullscreen API enforcement
- Visibility change detection
- Tab/focus switch tracking
- Counter persistence in localStorage
- Warning modal at 3 switches
- Force submit at 5 switches

#### 5. Speech Recognition
- Web Speech API integration
- Language-agnostic recognition
- Real-time transcription display
- Audio feedback on start/stop

#### 6. Answer Evaluation
- Context relevance scoring (0-100)
- Keyword matching algorithm
- Semantic similarity calculation
- Multi-language support

#### 7. Performance Tracking
- Individual score calculation
- Time taken tracking
- Historical performance storage
- Admin dashboard with rankings

---

## Technical Architecture

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- No framework dependencies (vanilla JS)
- LocalStorage for persistence
- Web Speech API
- Fullscreen API

### Backend Simulation
- All features simulated client-side
- Mock data for demonstration
- LocalStorage for data persistence

### Data Models

```javascript
User: {
  id, email, password, name, role,
  resume: { fileName, skills, jobCategory },
  tests: [{ testId, questions, answers, scores, takenAt }]
}

Question: {
  id, category, questionText, keywords, difficulty
}

Test: {
  id, userId, questions, answers, scores,
  tabSwitches, startTime, endTime, status
}
```

---

## Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme with cyan accents renders correctly
- [ ] All animations are smooth (60fps)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Glassmorphism effects visible
- [ ] Proper font loading

### Functional Checkpoints
- [ ] User can signup and login
- [ ] Resume upload works with file validation
- [ ] Skills are extracted from resume
- [ ] Fullscreen can be triggered
- [ ] Tab switch counter increments correctly
- [ ] Test exits after 5 tab switches
- [ ] Speech recognition starts/stops
- [ ] Text answers can be typed
- [ ] Scores are calculated and displayed
- [ ] Admin sees ranked candidate list

### Edge Cases
- [ ] Empty resume handling
- [ ] No microphone permission handling
- [ ] Browser without speech API
- [ ] LocalStorage quota exceeded

---

## File Structure

```
/Desktop/
├── index.html          # Main entry point
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── app.js         # Main application
│   ├── auth.js        # Authentication
│   ├── resume.js      # Resume handling
│   ├── test.js        # Assessment logic
│   ├── speech.js      # Speech recognition
│   ├── proctoring.js  # Tab switch detection
│   ├── evaluation.js  # Answer scoring
│   └── admin.js       # Admin dashboard
├── data/
│   └── mock.js        # Mock data & questions
└── SPEC.md           # This specification
```

