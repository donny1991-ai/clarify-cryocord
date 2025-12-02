# 🖼️ Update Logo Size - Deployment Guide

## Changes Made

I've increased the logo size in two places:

1. **Login Page:** From 400px × 133px → **600px × 200px** (50% bigger)
2. **Main App Header:** From h-8 (32px) → **h-12 (48px)** (50% bigger)

---

## 🚀 Deploy Updated Logo Sizes

Run these commands on your Mac:

### **1. Pull Latest Code:**
```bash
cd ~/clarify-cryocord
git pull origin main
```

### **2. Rebuild:**
```bash
npm run build
```

### **3. Deploy:**
```bash
firebase deploy --only hosting
```

### **4. View Updated Site:**
1. Wait 1-2 minutes
2. Open new incognito window (Cmd + Shift + N)
3. Visit: https://cryocord-ai-platform.web.app
4. Your logo should now be bigger! 🎨

---

## 📏 Want Different Size?

If you want the logo even bigger or smaller, edit these files:

**Login Page:** `src/components/Login.tsx` (line 91)
```tsx
style={{ width: '600px', height: '200px' }}  // Change these values
```

**Main App Header:** `src/components/MainApp.tsx` (line 104)
```tsx
className="h-12 w-auto"  // Change h-12 to h-16 for bigger, h-8 for smaller
```

Then rebuild and redeploy:
```bash
npm run build
firebase deploy --only hosting
```

---

## 📊 Current Sizes:

- **Login Logo:** 600px wide × 200px tall
- **Header Logo:** 48px tall (h-12 in Tailwind = 3rem = 48px)

---

**Quick Deploy Command:**
```bash
cd ~/clarify-cryocord && git pull origin main && npm run build && firebase deploy --only hosting
```
