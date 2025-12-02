# 📁 CryoClarify Project Layout

## 🗂️ Complete Project Structure

```
webapp/                                    ← Your project root
│
├── 📄 Configuration Files
│   ├── package.json                       ← Dependencies & scripts
│   ├── tsconfig.json                      ← TypeScript config
│   ├── tsconfig.node.json                 ← TypeScript Node config
│   ├── vite.config.ts                     ← Vite build tool config
│   ├── tailwind.config.js                 ← Tailwind CSS config
│   ├── postcss.config.js                  ← PostCSS config
│   ├── .gitignore                         ← Git ignore rules
│   └── index.html                         ← HTML entry point
│
├── 📚 Documentation Files
│   ├── README.md                          ← Full documentation
│   ├── QUICKSTART.md                      ← Quick start guide
│   ├── INTEGRATION_COMPLETE.md            ← Integration summary
│   └── PROJECT_LAYOUT.md                  ← This file
│
├── 📁 public/                             ← Static assets folder
│   └── (place clarify-logo-v3.png here)  ← ⚠️ ADD YOUR LOGO HERE
│
└── 📁 src/                                ← Source code folder
    │
    ├── 🎯 Main Application Files
    │   ├── main.tsx                       ← React entry point
    │   ├── App.tsx                        ← Main app (routing & auth)
    │   ├── index.css                      ← Global styles + animations
    │   └── firebaseConfig.ts              ← Firebase initialization
    │
    ├── 📁 components/                     ← React components
    │   ├── Login.tsx                      ← Login page with Firebase auth
    │   ├── MainApp.tsx                    ← Main chat interface + API
    │   └── AdminPanel.tsx                 ← Admin panel UI
    │
    └── 📁 types/                          ← TypeScript definitions
        └── index.ts                       ← Type interfaces
```

---

## 📊 File Sizes & Line Counts

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/Login.tsx` | 177 | Firebase authentication UI |
| `src/components/MainApp.tsx` | 180 | Chat interface + API calls |
| `src/components/AdminPanel.tsx` | 150 | Admin panel interface |
| `src/App.tsx` | 70 | Main routing & auth logic |
| `src/firebaseConfig.ts` | 29 | Firebase setup |
| `src/types/index.ts` | 20 | TypeScript interfaces |
| `src/index.css` | 82 | Animations & styles |

---

## 🎨 Key Components Overview

### 1️⃣ **Login Component** (`src/components/Login.tsx`)
```
┌─────────────────────────────────────────────────────────┐
│  BACKGROUND: Animated cells floating                    │
│  ┌──────────────────┬─────────────────────────────┐    │
│  │                  │                               │    │
│  │   CLARIFY LOGO   │    📋 SIGN IN FORM           │    │
│  │                  │                               │    │
│  │   "Clear answers,│    Email: _______________    │    │
│  │    clarity..."   │    Password: ____________    │    │
│  │                  │                               │    │
│  │                  │    [Secure Login Button]     │    │
│  │                  │                               │    │
│  └──────────────────┴─────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2️⃣ **Main App Component** (`src/components/MainApp.tsx`)
```
┌──────────────────────────────────────────────────────────┐
│  📋 Header: [Logo] [Admin Panel] [Logout] [User Avatar] │
├──────────────────────────────────────────────────────────┤
│                                                           │
│          🔍 Scientific Answers, Simplified.              │
│                                                           │
│      ┌─────────────────────────────────────────┐        │
│      │ Ask a question about protocols... 🔍   │        │
│      └─────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────┐  ┌──────────────────────┐     │
│  │ 📊 COMPLIANCE       │  │ 💬 CUSTOMER SCRIPT   │     │
│  │    SUMMARY          │  │                       │     │
│  │                     │  │  "Mr. Smith, I can    │     │
│  │ • FDA compliant     │  │   confirm..."         │     │
│  │ • ISO 9001 standards│  │                       │     │
│  │ • Safety measures   │  │  [📋 Copy to Clip]   │     │
│  └─────────────────────┘  └──────────────────────┘     │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 3️⃣ **Admin Panel** (`src/components/AdminPanel.tsx`)
```
┌──────────────────────────────────────────────────────────┐
│  📋 Header: Clarify Admin [Back] [Logout]               │
├──────────────────────────────────────────────────────────┤
│                                                           │
│     📚 Knowledge Base Management                         │
│                                                           │
│  ┌────────────────────────────────────────────────┐     │
│  │         📤 Upload Documents                     │     │
│  │                                                 │     │
│  │    Drag and drop PDF, DOCX, or TXT files      │     │
│  │                                                 │     │
│  │         [Select Files Button]                  │     │
│  └────────────────────────────────────────────────┘     │
│                                                           │
│  📋 Recent Uploads:                                      │
│  • CryoCord_SOP_v2.pdf          [✅ Processed]         │
│  • Sales_Script_2025.docx       [✅ Processed]         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Design Features

### Colors
- **Primary Red**: `#B01E2D` (CryoCord brand color)
- **Background**: Light grey with animated floating cells
- **Cards**: White with shadow
- **Borders**: Grey (compliance) / Red (customer script)

### Animations
- ✨ Floating cell background (20-25s cycles)
- ✨ Pulsing nucleus effects
- ✨ Particle floating
- ✨ Fade-in transitions between views
- ✨ Smooth hover effects

### Typography
- **Font**: Inter (from Google Fonts CDN)
- **Headings**: Bold, 2xl-4xl
- **Body**: Regular, sm-base

---

## 🔧 How Files Work Together

```
index.html (entry point)
    ↓
main.tsx (React initialization)
    ↓
App.tsx (main logic)
    ├── Checks authentication with Firebase
    ├── Manages view routing (login/app/admin)
    └── Renders appropriate component
        ├── Login.tsx (if not authenticated)
        ├── MainApp.tsx (default authenticated view)
        └── AdminPanel.tsx (admin view)
            ↓
All components use:
    • firebaseConfig.ts for auth
    • types/index.ts for TypeScript
    • index.css for styling
    • tailwind.config.js for theme
```

---

## 📦 Dependencies (from package.json)

### Production Dependencies
```json
{
  "react": "^18.2.0",           // React framework
  "react-dom": "^18.2.0",       // React DOM rendering
  "firebase": "^10.7.1"         // Firebase SDK
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^4.2.1",    // Vite React plugin
  "typescript": "^5.2.2",               // TypeScript
  "tailwindcss": "^3.4.0",             // Tailwind CSS
  "vite": "^5.0.8",                    // Build tool
  // ... and more
}
```

---

## 🎯 What Each File Does

| File | What It Does |
|------|-------------|
| **index.html** | HTML shell, loads React app |
| **main.tsx** | Initializes React, mounts to DOM |
| **App.tsx** | Manages auth state, routes views |
| **firebaseConfig.ts** | Connects to Firebase project |
| **Login.tsx** | Email/password login form |
| **MainApp.tsx** | Chat UI + API calls to backend |
| **AdminPanel.tsx** | File upload interface |
| **types/index.ts** | TypeScript type definitions |
| **index.css** | Global styles + animations |
| **tailwind.config.js** | Custom color theme |
| **vite.config.ts** | Build configuration |
| **package.json** | Dependencies + scripts |

---

## 🚀 npm Scripts Available

After installation, you can run:

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |

---

## 📝 File Naming Conventions

- **`.tsx`** = TypeScript + React (JSX)
- **`.ts`** = TypeScript only
- **`.js`** = JavaScript configuration
- **`.json`** = JSON configuration
- **`.css`** = Stylesheets
- **`.md`** = Markdown documentation

---

## 🎨 Color Palette Reference

```css
/* CryoCord Theme Colors */
--cryo-red: #B01E2D;          /* Primary brand color */
--cryo-dark: #111827;         /* Dark text */
--cryo-light: #F3F4F6;        /* Light background */
--microscope-light: #f8fafc;  /* Very light background */
--deep-charcoal: #1f2937;     /* Charcoal text */
--muted-grey: #6b7280;        /* Muted grey text */
```

---

## 🎭 Component State Flow

```
User Action → Component State Update → Re-render UI

Examples:
1. Type in login form → Update email/password state → Enable button
2. Click login → Set loading state → Call Firebase → Update auth state
3. Type question → Update question state → Enable submit button
4. Submit question → Set loading → API call → Update response state
```

---

## 🔒 Security Features

- ✅ Firebase handles password encryption
- ✅ ID tokens auto-refresh every hour
- ✅ Tokens sent as Bearer auth header
- ✅ No sensitive data stored in frontend
- ✅ HTTPS connections only
- ✅ Input validation on forms

---

This is your complete project layout! Everything is organized and ready for development.

**Next: See the installation steps below** 👇
