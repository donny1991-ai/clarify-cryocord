# 🔗 Backend Integration Guide - Connect to Vertex AI

## ✅ Frontend is Already Connected!

Your React app is **already configured** to send requests to your backend:

**Backend URL:** `https://cryocord-sales-query-1034418228298.us-central1.run.app`

### **What the Frontend Does:**

1. User types a question
2. Frontend gets Firebase ID token
3. Sends POST request with:
   - `Authorization: Bearer <FIREBASE_ID_TOKEN>`
   - `Content-Type: application/json`
   - Body: `{ "question": "user's question" }`
4. Receives response:
   ```json
   {
     "complianceSummary": "Internal compliance notes...",
     "customerAnswer": "Customer-facing answer..."
   }
   ```

---

## 🔧 Backend Requirements

Your backend at `https://cryocord-sales-query-1034418228298.us-central1.run.app` needs to:

### **1. Accept Firebase ID Tokens**
### **2. Enable CORS for Firebase URLs**
### **3. Process questions with Vertex AI**
### **4. Return proper JSON response**

---

## 🐍 Python Backend Example (Flask)

### **Required Packages:**

```bash
pip install flask flask-cors firebase-admin google-cloud-aiplatform
```

### **Complete Backend Code:**

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import auth, credentials
from google.cloud import aiplatform
import vertexai
from vertexai.generative_models import GenerativeModel

# Initialize Flask
app = Flask(__name__)

# Enable CORS for your Firebase URLs
CORS(app, origins=[
    'https://cryocord-ai-platform.web.app',
    'https://cryocord-ai-platform.firebaseapp.com',
    'http://localhost:3000'  # For local development
])

# Initialize Firebase Admin (for token verification)
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'projectId': 'cryocord-ai-platform'
})

# Initialize Vertex AI
PROJECT_ID = 'cryocord-ai-platform'
LOCATION = 'us-central1'  # or your preferred location

vertexai.init(project=PROJECT_ID, location=LOCATION)

# Initialize Gemini model
model = GenerativeModel('gemini-1.5-flash')

@app.route('/', methods=['POST', 'OPTIONS'])
def sales_query():
    """
    Handle sales queries with Firebase authentication and Vertex AI
    """
    
    # Handle preflight CORS request
    if request.method == 'OPTIONS':
        return '', 200
    
    # 1. VERIFY FIREBASE ID TOKEN
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid authorization header'}), 401
    
    id_token = auth_header.split('Bearer ')[1]
    
    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token['uid']
        user_email = decoded_token.get('email', 'unknown')
        
        print(f"Authenticated user: {user_email} (UID: {user_id})")
        
    except Exception as e:
        print(f"Token verification failed: {e}")
        return jsonify({'error': 'Invalid authentication token'}), 401
    
    # 2. GET QUESTION FROM REQUEST
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({'error': 'Missing question in request body'}), 400
    
    question = data['question'].strip()
    if not question:
        return jsonify({'error': 'Question cannot be empty'}), 400
    
    print(f"Processing question: {question}")
    
    # 3. QUERY VERTEX AI / GEMINI
    try:
        # Create compliance-focused prompt
        compliance_prompt = f"""
You are a CryoCord sales compliance assistant. Analyze this customer question and provide:

1. COMPLIANCE SUMMARY (for internal use):
   - Key regulatory considerations
   - Required disclosures
   - Risk factors to address
   - Recommended talking points

2. CUSTOMER ANSWER (for customer-facing response):
   - Clear, accurate answer
   - Compliant language
   - Relevant disclaimers if needed

Customer Question: {question}

Format your response as:
COMPLIANCE SUMMARY:
[Your internal compliance notes here]

CUSTOMER ANSWER:
[Your customer-facing response here]
"""
        
        # Query Gemini
        response = model.generate_content(compliance_prompt)
        full_response = response.text
        
        # Parse the response
        if "COMPLIANCE SUMMARY:" in full_response and "CUSTOMER ANSWER:" in full_response:
            parts = full_response.split("CUSTOMER ANSWER:")
            compliance_part = parts[0].replace("COMPLIANCE SUMMARY:", "").strip()
            customer_part = parts[1].strip()
        else:
            # Fallback if format is not followed
            compliance_part = "Review required: Model response format unexpected"
            customer_part = full_response
        
        # 4. RETURN RESPONSE
        return jsonify({
            'complianceSummary': compliance_part,
            'customerAnswer': customer_part,
            'user': user_email,
            'timestamp': datetime.datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        print(f"Vertex AI error: {e}")
        return jsonify({
            'error': 'Failed to process question with AI',
            'details': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'cryocord-sales-query'}), 200

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
```

---

## 🚀 Deploy to Google Cloud Run

### **1. Create requirements.txt:**

```txt
flask==3.0.0
flask-cors==4.0.0
firebase-admin==6.3.0
google-cloud-aiplatform==1.38.0
gunicorn==21.2.0
```

### **2. Create Dockerfile:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
```

### **3. Deploy to Cloud Run:**

```bash
# Set your project
gcloud config set project cryocord-ai-platform

# Deploy to Cloud Run
gcloud run deploy cryocord-sales-query \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars PROJECT_ID=cryocord-ai-platform

# Get the service URL
gcloud run services describe cryocord-sales-query \
  --region us-central1 \
  --format='value(status.url)'
```

The URL should be: `https://cryocord-sales-query-1034418228298.us-central1.run.app`

---

## 🧪 Test Your Backend

### **Test 1: Health Check**

```bash
curl https://cryocord-sales-query-1034418228298.us-central1.run.app/health
```

Expected:
```json
{"status": "healthy", "service": "cryocord-sales-query"}
```

### **Test 2: With Firebase Token**

From your browser console (logged into your app):

```javascript
// Get current user's token
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

// Test backend
const response = await fetch('https://cryocord-sales-query-1034418228298.us-central1.run.app', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    question: 'What are the benefits of cord blood banking?'
  })
});

const data = await response.json();
console.log(data);
```

Expected:
```json
{
  "complianceSummary": "...",
  "customerAnswer": "...",
  "user": "test@cryocord.com",
  "timestamp": "2024-12-02T..."
}
```

---

## ✅ Verification Checklist

### **Backend Requirements:**

- [ ] Backend deployed to Cloud Run
- [ ] Service URL: `https://cryocord-sales-query-1034418228298.us-central1.run.app`
- [ ] Firebase Admin SDK initialized
- [ ] CORS enabled for Firebase URLs:
  - `https://cryocord-ai-platform.web.app`
  - `https://cryocord-ai-platform.firebaseapp.com`
- [ ] Vertex AI / Gemini API enabled
- [ ] Service accepts POST requests with JSON body
- [ ] Service verifies Firebase ID tokens
- [ ] Service returns `complianceSummary` and `customerAnswer`

### **Frontend (Already Done):**

- ✅ Backend URL configured: `https://cryocord-sales-query-1034418228298.us-central1.run.app`
- ✅ Sends Firebase ID token in `Authorization` header
- ✅ Sends `Content-Type: application/json`
- ✅ Sends question in request body
- ✅ Displays `complianceSummary` and `customerAnswer`

---

## 🐛 Common Issues & Solutions

### **Issue 1: CORS Error**

**Error:** `Access-Control-Allow-Origin` error in browser console

**Solution:** Add CORS configuration to backend:
```python
CORS(app, origins=[
    'https://cryocord-ai-platform.web.app',
    'https://cryocord-ai-platform.firebaseapp.com'
])
```

### **Issue 2: Authentication Failed**

**Error:** `Invalid authentication token`

**Solution:** Verify Firebase Admin SDK is initialized:
```python
firebase_admin.initialize_app(credentials.ApplicationDefault(), {
    'projectId': 'cryocord-ai-platform'
})
```

### **Issue 3: Vertex AI Error**

**Error:** `Failed to process question with AI`

**Solution:** 
1. Enable Vertex AI API in Google Cloud Console
2. Set up Application Default Credentials
3. Grant service account permissions

---

## 📊 Expected Flow

```
User enters question
       ↓
Frontend gets Firebase ID token
       ↓
POST to backend with token
       ↓
Backend verifies token
       ↓
Backend queries Vertex AI / Gemini
       ↓
Backend returns:
  - complianceSummary (internal)
  - customerAnswer (customer-facing)
       ↓
Frontend displays both sections
```

---

## 🎯 Current Status

### **Frontend:**
- ✅ **READY** - Deployed and configured
- ✅ Backend URL: `https://cryocord-sales-query-1034418228298.us-central1.run.app`
- ✅ Firebase authentication working
- ✅ Sends proper requests

### **Backend:**
- ⏳ **NEEDS SETUP** - You need to:
  1. Deploy Python Flask app to Cloud Run
  2. Enable CORS for Firebase URLs
  3. Set up Firebase Admin SDK
  4. Connect to Vertex AI / Gemini
  5. Implement response parsing

---

## 🚀 Next Steps

1. **Deploy the backend code above** to Cloud Run
2. **Test health endpoint**: `curl https://cryocord-sales-query-1034418228298.us-central1.run.app/health`
3. **Test with Firebase token** from browser console
4. **Verify CORS** - no errors in browser console
5. **Test full flow** - enter question in your app

---

## 📞 Need Help?

If you need help with:
- Deploying to Cloud Run
- Setting up Vertex AI
- Firebase Admin SDK configuration
- CORS issues

Let me know and I'll provide more detailed instructions!

---

**Your frontend is ready - now you just need to deploy the backend!** 🚀
