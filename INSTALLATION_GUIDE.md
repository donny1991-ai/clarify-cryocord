# 🚀 Step-by-Step Installation Guide

## 📍 Current Location

Your project is already created at:
```
/home/user/webapp/
```

All the code files are ready. You just need to install dependencies!

---

## 🎯 Step 1: Install Dependencies

### What This Does
This command downloads all the required packages (React, Firebase, TypeScript, Tailwind, etc.) and puts them in a `node_modules` folder.

### The Command

**Option A: Using npm (recommended)**
```bash
cd /home/user/webapp
npm install
```

**Option B: If you prefer yarn**
```bash
cd /home/user/webapp
yarn install
```

**Option C: If you prefer pnpm**
```bash
cd /home/user/webapp
pnpm install
```

### What to Expect

1. You'll see output like this:
   ```
   npm install
   
   added 345 packages, and audited 346 packages in 1m
   
   87 packages are looking for funding
     run `npm fund` for details
   
   found 0 vulnerabilities
   ```

2. A `node_modules` folder will be created (this is normal and large - around 200-300MB)

3. A `package-lock.json` file will be created (locks dependency versions)

### Estimated Time
- **First install**: 1-3 minutes (depending on internet speed)
- **Already installed**: 10-30 seconds

### Common Issues

**Issue**: `npm: command not found`
- **Fix**: Install Node.js first: `https://nodejs.org/`

**Issue**: Permission errors
- **Fix**: Don't use `sudo`, or fix npm permissions

**Issue**: Network timeout
- **Fix**: Check internet connection, try again

---

## 📂 Step 2: Add Your Logo

### What to Do

1. Locate your logo file: `clarify-logo-v3.png`

2. Copy it to the `public/` folder:

   **Option A: Using command line**
   ```bash
   cp /path/to/your/clarify-logo-v3.png /home/user/webapp/public/
   ```

   **Option B: Using file browser**
   - Navigate to `/home/user/webapp/public/`
   - Drag and drop `clarify-logo-v3.png` into this folder

3. Verify it's there:
   ```bash
   ls -lh /home/user/webapp/public/
   ```

   You should see:
   ```
   clarify-logo-v3.png
   ```

### Logo Requirements
- **Filename**: Must be exactly `clarify-logo-v3.png`
- **Format**: PNG (with transparency if needed)
- **Recommended size**: 400x133 pixels (or similar aspect ratio)

### If You Don't Have the Logo Yet
The app will still work, but the logo won't display. You'll see a broken image icon.

---

## 🔥 Step 3: Enable Firebase Authentication

### Go to Firebase Console

1. Open: https://console.firebase.google.com/
2. Sign in with your Google account
3. Select your project: **cryocord-ai-platform**

### Enable Email/Password Authentication

1. In the left sidebar, click **Authentication**
2. Click the **Get Started** button (if first time)
3. Click the **Sign-in method** tab
4. Find **Email/Password** in the list
5. Click on it
6. Toggle **Enable** to ON
7. Click **Save**

**Visual Guide:**
```
Firebase Console
└── Authentication
    └── Sign-in method
        └── Email/Password [Toggle ON] ✅
```

### Create a Test User

1. Still in **Authentication**, click the **Users** tab
2. Click **Add user** button
3. Fill in:
   - **Email**: `test@cryocord.com` (or any email)
   - **Password**: `TestPass123!` (at least 6 characters)
4. Click **Add user**

**Screenshot locations:**
```
Authentication → Users → [Add user]
```

### Verify Setup
You should see your test user in the users list:
```
Email: test@cryocord.com
Created: just now
```

---

## 🎮 Step 4: Start the Development Server

### The Command
```bash
cd /home/user/webapp
npm run dev
```

### What to Expect

You'll see output like:
```
  VITE v5.0.8  ready in 523 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
  ➜  press h to show help
```

### Server Information

- **Local URL**: `http://localhost:3000`
- **Network URL**: Can access from other devices on same network
- **Hot Reload**: Changes to code automatically refresh the browser
- **Stop Server**: Press `Ctrl+C` in terminal

### Open in Browser

Click the URL or manually go to:
```
http://localhost:3000
```

---

## 🧪 Step 5: Test the Application

### Test Login

1. You should see the beautiful login screen with animated cells
2. Enter your test user credentials:
   - Email: `test@cryocord.com`
   - Password: `TestPass123!`
3. Click **Secure Login**
4. You should be redirected to the main app

### Test Chat Interface

1. You'll see the main screen with search box
2. Type a question: `"What is the cryopreservation process?"`
3. Click the search button (🔍)
4. Wait for the response (backend API will be called)
5. Response should appear in two cards:
   - **Compliance Summary** (grey border)
   - **Customer Script** (red border)

### Test Copy to Clipboard

1. In the Customer Script card
2. Click **Copy to Clipboard** button
3. You should see an alert: "Copied to clipboard!"
4. Try pasting (Ctrl+V) - you should see the customer script text

### Test Admin Panel

1. Click **Admin Panel** in header
2. You should see the admin interface with:
   - Upload area
   - Recent files list
3. Click **Back to App** to return

### Test Logout

1. Click **Logout** in header
2. You should be returned to login screen

---

## 🔧 Troubleshooting

### Problem: npm install fails

**Error**: `npm ERR! code ENOENT`
- **Cause**: Not in the right directory
- **Fix**: `cd /home/user/webapp` first

**Error**: `npm ERR! ERESOLVE unable to resolve dependency tree`
- **Fix**: Try `npm install --legacy-peer-deps`

**Error**: `npm ERR! network`
- **Cause**: Internet connection issue
- **Fix**: Check connection, try again

### Problem: Port 3000 already in use

**Error**: `Port 3000 is in use`
- **Fix Option 1**: Stop other process using port 3000
- **Fix Option 2**: Change port in `vite.config.ts`:
  ```typescript
  server: {
    port: 3001,  // Change to different port
  }
  ```

### Problem: Firebase errors

**Error**: "Firebase: Error (auth/invalid-email)"
- **Fix**: Check email format is valid

**Error**: "Firebase: Error (auth/user-not-found)"
- **Fix**: Create user in Firebase Console

**Error**: "Firebase: Error (auth/wrong-password)"
- **Fix**: Check password is correct (minimum 6 characters)

**Error**: "Firebase: Error (auth/too-many-requests)"
- **Fix**: Wait a few minutes, or reset password in Firebase Console

### Problem: Logo not showing

**Cause**: Logo file not in `public/` folder
**Fix**: 
```bash
# Check if logo exists
ls /home/user/webapp/public/

# Copy logo to public folder
cp /path/to/clarify-logo-v3.png /home/user/webapp/public/
```

### Problem: Styles look wrong

**Cause**: Tailwind CSS not compiling
**Fix**:
1. Stop server (Ctrl+C)
2. Delete node_modules: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Start again: `npm run dev`

### Problem: Backend API errors

**Error**: "Failed to fetch" or CORS error
- **Cause**: Backend might not be running or CORS not configured
- **Check**: 
  1. Verify backend URL in `src/components/MainApp.tsx`
  2. Check backend is deployed on Cloud Run
  3. Verify backend accepts requests with Authorization header
  4. Check backend has CORS enabled

**Error**: "401 Unauthorized"
- **Cause**: Firebase token not valid
- **Check**: 
  1. User is logged in
  2. Token is being sent in Authorization header
  3. Backend is verifying Firebase tokens correctly

---

## ✅ Installation Complete Checklist

After following all steps, you should have:

- [x] Dependencies installed (`node_modules` folder exists)
- [x] Logo in `public/` folder
- [x] Firebase Email/Password authentication enabled
- [x] Test user created in Firebase
- [x] Development server running on port 3000
- [x] Can login successfully
- [x] Can see main app interface
- [x] Can submit questions (even if backend not ready yet)
- [x] Can navigate to admin panel
- [x] Can logout

---

## 🎊 You're All Set!

Your development environment is now ready. You can:

1. **Develop**: Make changes to code, see them live
2. **Test**: Test all features and functionality
3. **Debug**: Use browser DevTools (F12) to debug
4. **Build**: When ready, run `npm run build` for production

---

## 📚 Next Steps

1. **Connect Backend**: Make sure your Cloud Run function is deployed and accessible
2. **Test API**: Use the chat interface to test backend integration
3. **Customize**: Modify colors, text, features as needed
4. **Deploy**: When ready, build and deploy to hosting platform

---

## 🆘 Need More Help?

### Useful Commands

```bash
# Check if dependencies installed
ls node_modules

# Check Node.js version
node --version

# Check npm version
npm --version

# View dev server logs
# (already visible when running npm run dev)

# Stop dev server
# Press Ctrl+C in terminal

# Clear npm cache (if issues)
npm cache clean --force

# Reinstall everything
rm -rf node_modules package-lock.json
npm install
```

### Browser DevTools (F12)

- **Console tab**: See JavaScript errors and logs
- **Network tab**: See API requests and responses
- **Application tab**: See Firebase auth status
- **Elements tab**: Inspect HTML and CSS

### Check Files

```bash
# See all files in project
ls -la /home/user/webapp/

# See source files
ls -la /home/user/webapp/src/

# See components
ls -la /home/user/webapp/src/components/

# Check if logo exists
ls -la /home/user/webapp/public/
```

---

**Good luck! 🚀**
