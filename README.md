# CryoClarify - CryoCord Sales Compliance Assistant

A React/TypeScript web application that provides CryoCord sales representatives with AI-powered compliance summaries and customer-facing scripts for technical questions.

## 🚀 Features

- **Firebase Authentication** - Secure email/password login
- **AI-Powered Responses** - Integration with Google Cloud backend (Vertex AI Search)
- **Compliance Summaries** - Internal compliance information for sales reps
- **Customer Scripts** - Pre-approved customer-facing responses
- **Admin Panel** - Knowledge base management interface (UI ready for backend integration)
- **Beautiful UI** - Scientifically-themed design with ambient animations

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Google Cloud Run (Gen 2) + Vertex AI Search
- **Project ID**: cryocord-ai-platform

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication enabled
- Google Cloud project with Cloud Run function deployed

## 🔧 Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   cd webapp
   npm install
   ```

3. **Add your logo**
   - Place `clarify-logo-v3.png` in the `public/` folder

4. **Verify Firebase configuration**
   - Firebase config is already set in `src/firebaseConfig.ts`
   - Backend URL is configured in `src/components/MainApp.tsx`

## 🎯 Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🔐 Firebase Authentication Setup

### Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **cryocord-ai-platform**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Email/Password** provider
5. Click **Save**

### Create Test Users

In the Firebase Console:
1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter email and password
4. Click **Add user**

Example test user:
- Email: `test@cryocord.com`
- Password: `TestPassword123!`

## 🌐 Backend API Integration

The app connects to your Cloud Run backend:

**Backend URL**: `https://cryocord-sales-query-1034418228298.us-central1.run.app`

### Authentication Flow

1. User logs in with Firebase email/password
2. App obtains Firebase ID token
3. Token is sent with each API request in the `Authorization` header:
   ```
   Authorization: Bearer <FIREBASE_ID_TOKEN>
   ```

### API Request Format

```typescript
POST https://cryocord-sales-query-1034418228298.us-central1.run.app
Headers:
  Content-Type: application/json
  Authorization: Bearer <FIREBASE_ID_TOKEN>

Body:
{
  "question": "What is the cryopreservation process?"
}
```

### API Response Format

```typescript
{
  "complianceSummary": "Internal compliance information...",
  "customerAnswer": "Customer-facing script..."
}
```

## 🔒 Backend Token Verification

Your Cloud Run function should verify the Firebase ID token:

```python
from firebase_admin import auth

def verify_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise ValueError("Invalid token")
```

## 📁 Project Structure

```
webapp/
├── src/
│   ├── components/
│   │   ├── Login.tsx          # Firebase email/password login
│   │   ├── MainApp.tsx         # Main chat interface with API calls
│   │   └── AdminPanel.tsx      # Admin interface (UI only)
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── firebaseConfig.ts       # Firebase initialization
│   ├── App.tsx                 # Main app with routing logic
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles + animations
├── public/
│   └── clarify-logo-v3.png    # App logo (place here)
├── index.html                 # HTML template
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

## 🎨 Design Features

- **Ambient Background**: Floating cell animations on login screen
- **Responsive Layout**: Works on desktop and mobile
- **Custom Color Scheme**: CryoCord red (#B01E2D) branding
- **Smooth Transitions**: Fade-in animations between views
- **Inter Font**: Clean, modern typography

## 🚀 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## 🔍 Testing the Integration

1. **Start the app**: `npm run dev`
2. **Login** with Firebase credentials
3. **Submit a question** in the chat interface
4. **Verify**:
   - Loading state appears
   - API call includes Authorization header
   - Response displays in both cards
   - Copy to clipboard works

### Troubleshooting

**Login fails**:
- Check Firebase Authentication is enabled
- Verify user exists in Firebase Console
- Check browser console for error messages

**API calls fail**:
- Verify backend URL is correct
- Check backend is deployed and running
- Verify backend accepts Firebase ID tokens
- Check CORS is enabled on backend
- Look at Network tab in browser DevTools

**Styling issues**:
- Ensure Tailwind CSS is properly configured
- Verify Inter font loads from Google Fonts
- Check logo file exists in `public/` folder

## 📝 Environment Variables (Optional)

For different environments, create `.env` files:

```bash
# .env.development
VITE_BACKEND_URL=https://cryocord-sales-query-1034418228298.us-central1.run.app

# .env.production
VITE_BACKEND_URL=https://your-production-url.run.app
```

Then update `MainApp.tsx`:
```typescript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
```

## 🤝 Contributing

This is a private CryoCord project. For questions or issues, contact the development team.

## 📄 License

Proprietary - CryoCord AI Platform

---

**Project**: cryocord-ai-platform  
**App**: CryoClarify (clarify)  
**Version**: 1.0.0  
**Last Updated**: 2025
