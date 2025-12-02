# 🚀 CryoClarify - Quick Start Guide

## Step 1: Install Dependencies

```bash
cd /home/user/webapp
npm install
```

## Step 2: Add Your Logo

Place `clarify-logo-v3.png` in the `public/` folder:

```bash
cp /path/to/your/clarify-logo-v3.png public/
```

## Step 3: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **cryocord-ai-platform**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Email/Password**
5. Add a test user in the **Users** tab

## Step 4: Start Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Step 5: Test the Integration

1. **Login** with your Firebase user credentials
2. **Ask a question**: "What is the cryopreservation process?"
3. **Verify** the response appears in both cards

## 🔧 Configuration Summary

### ✅ Already Configured

- **Firebase Config**: `src/firebaseConfig.ts`
  - Project ID: `cryocord-ai-platform`
  - All Firebase credentials included

- **Backend URL**: `src/components/MainApp.tsx`
  - URL: `https://cryocord-sales-query-1034418228298.us-central1.run.app`

### 🎯 What You Need to Do

1. ✅ Install dependencies (`npm install`)
2. ✅ Add logo to `public/` folder
3. ✅ Enable Email/Password auth in Firebase Console
4. ✅ Create a test user in Firebase
5. ✅ Start the dev server (`npm run dev`)

## 🐛 Troubleshooting

### Login Issues
- **Check**: Firebase Authentication is enabled
- **Check**: Test user exists
- **Fix**: Go to Firebase Console → Authentication → Users → Add user

### API Issues
- **Check**: Backend is running on Cloud Run
- **Check**: Backend accepts Firebase ID tokens
- **Fix**: Verify backend deployment and CORS settings

### Styling Issues
- **Check**: Logo file is in `public/` folder
- **Check**: Logo filename is exactly `clarify-logo-v3.png`
- **Fix**: Rename or move logo to correct location

## 📖 Full Documentation

See [README.md](./README.md) for complete documentation.

---

**Need Help?** Check the browser console (F12) for error messages.
