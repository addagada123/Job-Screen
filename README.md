# JobScreen Pro - Blue Collar Job Screening Platform

## Features Implemented

✅ **Resume Upload** - PDF, DOCX, JPG, PNG with auto skill extraction
✅ **Job Category Detection** - Plumbing, Masonry, Driving, Electrical, Carpentry, Painting
✅ **Voice Answering** - Hold to speak (any language)
✅ **Text Answering** - Type answers in any language
✅ **Fullscreen Enforcement** - Required during test
✅ **Tab Switch Detection** - Warning at 4, auto-submit at 5 switches
✅ **AI Question Generation** - Uses DeepSeek API for dynamic questions
✅ **AI Answer Evaluation** - Context relevance scoring
✅ **Admin Dashboard** - Ranked candidates by performance
✅ **Admin Approval System** - Request and approve admin access
✅ **Google Sign-In** - Firebase Authentication integrated

## Login Credentials

- **Admin:** admin@jobscreen.com / admin123
- **Regular User:** Sign up with email/password or Google

## Quick Start

1. Open `index.html` in Chrome or Edge
2. Sign up or login
3. Upload a resume (use filename like "rajesh_plumber.pdf")
4. Take the assessment test
5. View results
6. Admin can view ranked candidates

## Files Structure

```
/Desktop/
├── index.html          # Main HTML
├── css/styles.css      # Styling
├── data/mock.js        # Question banks
├── js/auth.js         # Authentication
├── js/firebase.js     # Firebase config
├── js/ai.js           # AI question generation
├── js/resume.js       # Resume processing
├── js/speech.js       # Voice recognition
├── js/proctoring.js   # Tab detection
├── js/evaluation.js   # Answer scoring
├── js/test.js         # Test logic
├── js/admin.js        # Admin dashboard
├── js/app.js          # Main app
└── README.md
```

## API Keys Configured

- **Firebase:** job-screen project ✓
- **DeepSeek AI:** Configured for question generation ✓
- **Google Sign-In:** Configured ✓

## How It Works

1. **User signs up** → Uploads resume
2. **AI extracts skills** → Detects job category
3. **Test generates questions** → Uses AI (DeepSeek)
4. **User answers** → Voice or text (any language)
5. **AI evaluates** → Context relevance scoring
6. **Admin views** → Ranked candidate list

## Browser Requirements

- Chrome, Edge, or Safari (for voice recognition)
- JavaScript enabled
- LocalStorage enabled

