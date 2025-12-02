# 🚀 Quick Deploy Guide

## 📦 Deploy Vertex AI RAG Backend to Cloud Run

### **Step 1: Open Cloud Shell**
1. Go to: https://console.cloud.google.com/
2. Click the `>_` icon in top-right corner
3. Cloud Shell terminal opens at bottom

### **Step 2: Enable APIs**
```bash
gcloud config set project cryocord-ai-platform

gcloud services enable \
  run.googleapis.com \
  aiplatform.googleapis.com \
  storage.googleapis.com
```

### **Step 3: Download Backend Files**
```bash
# Clone your repo
git clone https://github.com/donny1991-ai/clarify-cryocord.git
cd clarify-cryocord/backend
```

### **Step 4: Deploy to Cloud Run**
```bash
gcloud run deploy cryocord-sales-query \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --timeout 300
```

This will:
- Build your container
- Deploy to Cloud Run
- Give you the URL: `https://cryocord-sales-query-1034418228298.us-central1.run.app`

### **Step 5: Test**
```bash
curl https://cryocord-sales-query-1034418228298.us-central1.run.app/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "cryocord-sales-query",
  "vertex_rag": "enabled"
}
```

### **Step 6: Test from Your App**
1. Go to: https://cryocord-ai-platform.web.app
2. Log in
3. Go to Admin Panel
4. Upload a PDF document
5. Go to chat and ask a question
6. You'll get RAG-powered answers!

---

## ✅ What's Included

- ✅ Firebase Authentication
- ✅ CORS configured for your frontend
- ✅ Vertex AI RAG for knowledge base
- ✅ File upload endpoint
- ✅ Smart question answering
- ✅ Source citations in responses

---

## 🎯 API Endpoints

- `GET /health` - Health check
- `POST /` - Ask question (requires auth)
- `POST /upload` - Upload file (requires auth)
- `GET /files` - List files (requires auth)
- `DELETE /files/:filename` - Delete file (requires auth)

---

Deployment takes about 3-5 minutes! ⏰
