# 🔧 TROUBLESHOOTING: CryoCord AI Platform Deployment Issue

**Last Updated:** December 4, 2024  
**Status:** 🚨 BLOCKED - Vertex AI Publisher Models API 404 Error

---

## 📝 PROJECT CONTEXT

We are deploying a **CryoCord AI Sales Assistant** web application with the following architecture:
- **Frontend**: React/TypeScript app hosted on Firebase Hosting at `https://cryocord-ai-platform.web.app`
- **Backend**: Python Flask API deployed on Google Cloud Run at `https://cryocord-sales-query-1034418228298.us-central1.run.app`
- **Project ID**: `cryocord-ai-platform`
- **Region**: `us-central1`
- **GitHub Repo**: `https://github.com/donny1991-ai/clarify-cryocord`

**Application Features:**
- Firebase Authentication (email/password)
- Document upload to Google Cloud Storage (`gs://cryocord-ai-platform-rag-docs`)
- RAG (Retrieval-Augmented Generation) using Vertex AI Gemini models
- Document text extraction (PDF, DOCX, TXT)
- AI-powered sales query responses with compliance summaries

---

## ✅ SUCCESSFULLY COMPLETED STEPS

### 1. Google Cloud Project Setup
```bash
# Set active project
gcloud config set project cryocord-ai-platform

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable generativelanguage.googleapis.com
gcloud services enable cloudaicompanion.googleapis.com
```

### 2. Backend Code Deployment
```bash
# Clone repository
git clone https://github.com/donny1991-ai/clarify-cryocord.git
cd clarify-cryocord/backend

# Deploy to Cloud Run
gcloud run deploy cryocord-sales-query \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --timeout 300 \
  --clear-base-image
```

**Deployment Results:**
- ✅ Service URL: `https://cryocord-sales-query-1034418228298.us-central1.run.app`
- ✅ Current revision: `cryocord-sales-query-00007-4ch`
- ✅ Health endpoint working

### 3. Cloud Storage Configuration
```bash
# Create storage bucket
gcloud storage buckets create gs://cryocord-ai-platform-rag-docs --location=us-central1

# Grant permissions to Cloud Run service account
gcloud storage buckets add-iam-policy-binding gs://cryocord-ai-platform-rag-docs \
  --member=serviceAccount:1034418228298-compute@developer.gserviceaccount.com \
  --role=roles/storage.objectAdmin

gcloud storage buckets add-iam-policy-binding gs://cryocord-ai-platform-rag-docs \
  --member=serviceAccount:1034418228298-compute@developer.gserviceaccount.com \
  --role=roles/storage.legacyBucketReader
```

### 4. Vertex AI Permissions
```bash
# Grant Vertex AI access to service account
gcloud projects add-iam-policy-binding cryocord-ai-platform \
  --member=serviceAccount:1034418228298-compute@developer.gserviceaccount.com \
  --role=roles/aiplatform.user
```

### 5. Cloud Run Authentication
- ✅ Changed service from "Require authentication" to "Allow public access" in Cloud Run console
- ✅ Health endpoint confirmed working:
  ```bash
  curl https://cryocord-sales-query-1034418228298.us-central1.run.app/health
  ```
  Returns: `{"status": "healthy", "service": "cryocord-sales-query", "vertex_ai": "enabled", "rag": "document-based", "file_uploads": "enabled"}`

### 6. Verified API Enablement
```bash
gcloud services list --enabled --project=cryocord-ai-platform | grep -E "(aiplatform|generative|vertex)"
```
Results:
- ✅ `aiplatform.googleapis.com` (enabled)
- ✅ `generativelanguage.googleapis.com` (enabled)

---

## ❌ CRITICAL ISSUE: Vertex AI Publisher Models API 404 Error

### Error Message
```
404: The requested URL /v1/projects/cryocord-ai-platform/locations/us-central1/publishers/google/models was not found on this server.
```

### When Error Occurs
- When the backend tries to initialize any Vertex AI Gemini model
- When making HTTP requests to Vertex AI Publisher Models API endpoint
- Confirmed in frontend console when submitting questions at `https://cryocord-ai-platform.web.app`

### Direct API Test Results
```bash
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://us-central1-aiplatform.googleapis.com/v1/projects/cryocord-ai-platform/locations/us-central1/publishers/google/models"
```
Response: `404: The requested URL was not found on this server.`

---

## 🔄 ALL ATTEMPTED SOLUTIONS (ALL FAILED)

### Attempt 1: Different Model Names
Tried loading models with various names:
- ❌ `gemini-1.5-flash-002` → 404
- ❌ `gemini-1.5-flash-001` → 404
- ❌ `gemini-1.5-flash` → 404
- ❌ `gemini-1.5-pro-001` → 404
- ❌ `gemini-pro` → 404
- ❌ `text-bison@002` → 404
- ❌ `text-bison` → 404
- ❌ `gemini-1.0-pro` → 404

All resulted in:
```
404 Publisher Model `projects/cryocord-ai-platform/locations/us-central1/publishers/google/models/{model_name}` was not found or your project does not have access to it.
```

### Attempt 2: Vertex AI Python SDK
Backend code:
```python
from vertexai.generative_models import GenerativeModel
import vertexai

vertexai.init(project=PROJECT_ID, location=LOCATION)
model = GenerativeModel('gemini-pro')
```
Result: `ImportError: cannot import name 'rag' from 'vertexai.preview'` (deprecated API)

Then tried:
```python
from vertexai.generative_models import GenerativeModel
model = GenerativeModel('gemini-pro')
```
Result: Still 404 when calling `model.generate_content()`

### Attempt 3: Vertex AI REST API (Direct HTTP)

**Format A - OpenAPI Chat Completions:**
```python
url = f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/endpoints/openapi/chat/completions"
payload = {
    "model": "google/gemini-pro",
    "messages": [{"role": "user", "content": prompt}]
}
```
Result: ❌ 404

**Format B - generateContent Endpoint:**
```python
url = f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/gemini-pro:generateContent"
payload = {
    "contents": [{
        "role": "user",
        "parts": [{"text": prompt}]
    }]
}
```
Result: ❌ 404

### Attempt 4: Vertex AI Studio Console Access
- ✅ User successfully accessed Vertex AI Studio at: `https://console.cloud.google.com/vertex-ai/studio/freeform?project=cryocord-ai-platform`
- ✅ Confirmed can see Gemini models in UI (Gemini 3 Pro, Veo 3.1 visible)
- ❌ However, **API endpoint still returns 404**
- **Conclusion**: Console access ≠ API access

### Attempt 5: Enable Additional APIs
```bash
gcloud services enable cloudaicompanion.googleapis.com
gcloud services enable generativelanguage.googleapis.com
```
Result: ✅ APIs enabled successfully, but ❌ 404 persists

### Attempt 6: Fallback Model Logic
Created smart fallback that tries multiple models sequentially:
```python
models_to_try = [
    'gemini-1.0-pro',
    'gemini-pro', 
    'gemini-1.5-pro',
    'text-bison@002',
    'text-bison'
]
```
Result: ❌ ALL models return 404

### Attempt 7: Switch to PaLM 2 (text-bison)
```python
model = GenerativeModel('text-bison@002')
```
Result: ❌ Same 404 error - Publisher Models API not accessible

---

## 🚧 SECONDARY ISSUE: Cloud Build Failures

After modifying backend code to use REST API approach, deployments started failing:

**Command:**
```bash
gcloud run deploy cryocord-sales-query --source . --platform managed --region us-central1 --allow-unauthenticated --memory 2Gi --timeout 300
```

**Result:**
```
Building Container... Logs are available at [https://console.cloud.google.com/cloud-build/builds;region=us-central1/...]
....failed
Deployment failed
ERROR: (gcloud.run.deploy) Build failed; check build logs for details
```

**Failed Build IDs:**
- `ebbc6b4b-b752-43e8-8afb-e7b348e58dd7`
- `035e388c-c4ab-4db1-b905-567ac53d89f0`
- `59487510-440c-46be-acb9-484cf1c12102`

### Current Backend Files

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
```

**requirements.txt:**
```
flask==3.0.0
flask-cors==4.0.0
firebase-admin==6.3.0
google-cloud-storage==2.14.0
google-auth==2.23.0
requests==2.31.0
PyPDF2==3.0.1
python-docx==1.1.0
gunicorn==21.2.0
```

---

## 🔍 DIAGNOSTIC INFORMATION

### Working Endpoints
- ✅ `https://cryocord-sales-query-1034418228298.us-central1.run.app/health` → Returns 200 OK
- ✅ Cloud Storage bucket accessible via `gsutil ls gs://cryocord-ai-platform-rag-docs`
- ✅ Firebase Authentication working (can log in with `test@cryocord.com`)

### Not Working
- ❌ Any Vertex AI model loading or API call
- ❌ `/v1/projects/.../publishers/google/models` endpoint (404)
- ❌ Cloud Build completing successfully (recent attempts)

### Environment
- User: `don_calaki@cloudshell`
- Working Directory: `~/clarify-cryocord/backend`
- Active Project: `cryocord-ai-platform`

---

## ❓ QUESTIONS FOR EXPERT ASSISTANCE

1. **Why is the Vertex AI Publisher Models API returning 404** even though:
   - `aiplatform.googleapis.com` is enabled
   - Service account has `roles/aiplatform.user`
   - User can access Vertex AI Studio console
   - All recommended APIs are enabled

2. **Is there a separate enablement step** for the `/publishers/google/models` endpoint specifically?

3. **Are there organization policies** blocking access to Publisher Models API in this project?

4. **Should we use a different API endpoint format** for Vertex AI Gemini models?

5. **What is causing the Cloud Build failures** during Docker container build with the current requirements.txt?

6. **Is there an alternative Vertex AI approach** that doesn't use the Publisher Models API (e.g., Vertex AI Search & Conversation)?

---

## 🎯 DESIRED OUTCOME

Successfully deploy a working backend that can:
1. Accept authenticated user questions
2. Retrieve documents from Cloud Storage
3. Use Vertex AI Gemini to generate AI-powered responses
4. Return compliance summaries and customer answers
5. Function without 404 errors from Vertex AI API

**OR** receive clear guidance on alternative approaches if Publisher Models API is not accessible in this project.

---

## 📎 RELEVANT LINKS

- [Project Console](https://console.cloud.google.com/?project=cryocord-ai-platform)
- [Vertex AI Studio](https://console.cloud.google.com/vertex-ai/studio?project=cryocord-ai-platform)
- [Cloud Run Service](https://console.cloud.google.com/run/detail/us-central1/cryocord-sales-query?project=cryocord-ai-platform)
- [Latest Build Logs](https://console.cloud.google.com/cloud-build/builds;region=us-central1/59487510-440c-46be-acb9-484cf1c12102?project=1034418228298)
- [GitHub Repository](https://github.com/donny1991-ai/clarify-cryocord)

---

## 💡 POTENTIAL SOLUTIONS TO EXPLORE

### Option 1: Contact Google Cloud Support
- Open support ticket specifically about Publisher Models API 404
- Ask about organization policies blocking access
- Request enablement of Vertex AI Generative Models API

### Option 2: Use External AI Service
- Switch to OpenAI API (requires API key)
- Switch to Anthropic Claude API (requires API key)
- Modify backend to use alternative AI provider

### Option 3: Vertex AI Search & Conversation
- Use Discovery Engine instead of Publisher Models
- Different API endpoint that may be accessible
- Requires different setup and code structure

### Option 4: Deploy Simple Backend First
- Deploy non-AI backend to unblock frontend
- Add AI functionality later once API access resolved
- Allows app to be functional while troubleshooting

---

**For immediate assistance, this document can be shared with:**
- Google Cloud Support
- Stack Overflow (tag: google-cloud-platform, vertex-ai)
- Google Cloud Community Forums
- AI assistance platforms
