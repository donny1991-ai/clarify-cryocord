from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import auth, credentials
from google.cloud import storage, aiplatform
import vertexai
from vertexai.generative_models import GenerativeModel
import os
from datetime import datetime

app = Flask(__name__)

CORS(app, 
    origins=[
        'https://cryocord-ai-platform.web.app',
        'https://cryocord-ai-platform.firebaseapp.com',
        'http://localhost:3000'
    ],
    allow_headers=['Content-Type', 'Authorization'],
    methods=['GET', 'POST', 'OPTIONS', 'DELETE'],
    supports_credentials=True
)

PROJECT_ID = 'cryocord-ai-platform'
LOCATION = 'us-central1'
BUCKET_NAME = f'{PROJECT_ID}-rag-docs'

cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {'projectId': PROJECT_ID})

vertexai.init(project=PROJECT_ID, location=LOCATION)
aiplatform.init(project=PROJECT_ID, location=LOCATION)

storage_client = storage.Client()
model = GenerativeModel('gemini-1.5-flash')

def verify_firebase_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, 'Missing Authorization header'
    id_token = auth_header.split('Bearer ')[1]
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token, None
    except Exception as e:
        return None, str(e)

def ensure_bucket_exists():
    try:
        bucket = storage_client.get_bucket(BUCKET_NAME)
        return bucket
    except:
        bucket = storage_client.create_bucket(BUCKET_NAME, location=LOCATION)
        return bucket

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'cryocord-sales-query',
        'vertex_ai': 'enabled',
        'file_uploads': 'enabled'
    }), 200

@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    if request.method == 'OPTIONS':
        return '', 200
    
    user, error = verify_firebase_token()
    if error:
        return jsonify({'error': error}), 401
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        bucket = ensure_bucket_exists()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_filename = f"{timestamp}_{file.filename}"
        blob = bucket.blob(f"uploads/{safe_filename}")
        blob.upload_from_file(file)
        
        blob.metadata = {
            'uploaded_by': user.get('email', 'unknown'),
            'original_name': file.filename,
            'upload_time': timestamp
        }
        blob.patch()
        
        return jsonify({
            'success': True,
            'filename': safe_filename,
            'gcs_uri': f"gs://{BUCKET_NAME}/uploads/{safe_filename}",
            'uploaded_by': user.get('email'),
            'timestamp': timestamp
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/files', methods=['GET'])
def list_files():
    user, error = verify_firebase_token()
    if error:
        return jsonify({'error': error}), 401
    
    try:
        bucket = storage_client.get_bucket(BUCKET_NAME)
        blobs = bucket.list_blobs(prefix='uploads/')
        
        files = []
        for blob in blobs:
            files.append({
                'name': blob.name.replace('uploads/', ''),
                'size': blob.size,
                'created': blob.time_created.isoformat(),
                'contentType': blob.content_type
            })
        
        return jsonify({'files': files, 'count': len(files)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/files/<filename>', methods=['DELETE'])
def delete_file(filename):
    user, error = verify_firebase_token()
    if error:
        return jsonify({'error': error}), 401
    
    try:
        bucket = storage_client.get_bucket(BUCKET_NAME)
        blob = bucket.blob(f'uploads/{filename}')
        blob.delete()
        return jsonify({
            'success': True,
            'message': f'Deleted {filename}',
            'deleted_by': user.get('email')
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['POST', 'OPTIONS'])
def sales_query():
    if request.method == 'OPTIONS':
        return '', 200
    
    user, error = verify_firebase_token()
    if error:
        return jsonify({'error': error}), 401
    
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({'error': 'Missing question'}), 400
    
    question = data['question'].strip()
    if not question:
        return jsonify({'error': 'Question cannot be empty'}), 400
    
    try:
        # Get uploaded files for context
        try:
            bucket = storage_client.get_bucket(BUCKET_NAME)
            blobs = list(bucket.list_blobs(prefix='uploads/', max_results=5))
            context_info = f"\n\nKnowledge base: {len(blobs)} documents available" if blobs else ""
        except:
            blobs = []
            context_info = ""
        
        prompt = f"""You are a CryoCord sales compliance assistant.

Customer Question: {question}
{context_info}

Provide:

1. COMPLIANCE SUMMARY (internal):
   - Key regulatory considerations
   - Required disclosures
   - Risk factors
   - Talking points

2. CUSTOMER ANSWER (customer-facing):
   - Clear, accurate answer
   - Compliant language
   - Disclaimers if needed
"""
        
        response = model.generate_content(prompt)
        full_response = response.text
        
        if "COMPLIANCE SUMMARY:" in full_response and "CUSTOMER ANSWER:" in full_response:
            parts = full_response.split("CUSTOMER ANSWER:")
            compliance_part = parts[0].replace("COMPLIANCE SUMMARY:", "").strip()
            customer_part = parts[1].strip()
        else:
            compliance_part = "Review required"
            customer_part = full_response
        
        return jsonify({
            'complianceSummary': compliance_part,
            'customerAnswer': customer_part,
            'user': user.get('email'),
            'timestamp': datetime.now().isoformat(),
            'documents_available': len(blobs) if blobs else 0
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
