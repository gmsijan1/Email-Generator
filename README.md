# Email Generator AI - MVP Sales Email Tool

A React-based MVP application for generating AI-powered sales emails using Firebase and OpenAI GPT.

## Features

- **Firebase Authentication**
  - Email/password registration and login
  - Google OAuth sign-in
  - User profile management in Firestore

- **Email Draft Generation**
  - Form inputs: recipient name, email, context, goal, tone
  - OpenAI GPT integration for generating 1-3 draft options
  - Save drafts to Firestore

- **Draft Management**
  - Dashboard to view all saved drafts
  - View, edit, and delete drafts
  - Real-time updates from Firestore

- **Secure Routing**
  - Private routes for authenticated pages
  - Automatic redirect to login for unauthenticated users

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend Services**: Firebase (Authentication, Firestore)
- **AI Integration**: OpenAI GPT API
- **Routing**: React Router v6
- **Styling**: Custom CSS with responsive design

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password and Google providers)
3. Create a Firestore database
4. Add Firebase config values to `.env` (or `.env.local`)

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=1:xxx:web:xxx
```

### 3. Configure OpenAI

1. Get an API key from https://platform.openai.com
2. Update \`src/config/openaiConfig.js\` with your API key

**Note**: For production, move API calls to a backend server to keep your API key secure.

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

### 5. Build for Production

\`\`\`bash
npm run build
\`\`\`

### 6. Deploy to Firebase Hosting

\`\`\`bash
firebase login
firebase init
firebase deploy
\`\`\`

## Project Structure

- \`src/config/\` - Configuration files
- \`src/contexts/\` - React context providers
- \`src/services/\` - API service functions
- \`src/components/\` - Reusable components
- \`src/pages/\` - Page components
- \`src/firebase.js\` - Firebase initialization
- \`firebase.json\` - Firebase hosting configuration

## Security Considerations

1. Never commit API keys to version control
2. Move OpenAI calls to a backend server in production
3. Set up proper Firestore security rules
4. Use environment variables for sensitive data

### Firestore Rules (React-only app)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null
                        && request.auth.uid == userId;

      match /drafts/{draftId} {
        allow read, write: if request.auth != null
                          && request.auth.uid == userId;
      }

      match /emails/{emailId} {
        allow read, write: if request.auth != null
                          && request.auth.uid == userId;
      }
    }
  }
}
```

## License

MIT License
