from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import auth, credentials
from google.cloud import storage
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel
import vertexai
import os
from datetime import datetime
import tempfile
import PyPDF2
import docx

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

# Initialize Firebase Admin
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {'projectId': PROJECT_ID})

# Initialize Vertex AI
vertexai.init(project=PROJECT_ID, location=LOCATION)
aiplatform.init(project=PROJECT_ID, location=LOCATION)

storage_client = storage.Client()
model = GenerativeModel('gemini-1.5-flash-002')

def verify_firebase_token():
    """Verify Firebase ID token"""
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
    """Create storage bucket if needed"""
    try:
        bucket = storage_client.get_bucket(BUCKET_NAME)
        return bucket
    except:
        try:
            bucket = storage_client.create_bucket(BUCKET_NAME, location=LOCATION)
            return bucket
        except Exception as e:
            print(f"Bucket creation error: {e}")
            return None

def extract_text_from_pdf(file_path):
    """Extract text from PDF"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def extract_text_from_docx(file_path):
    """Extract text from DOCX"""
    try:
        doc = docx.Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""

def extract_text_from_txt(file_path):
    """Extract text from TXT"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"TXT extraction error: {e}")
        return ""

def get_document_text(gcs_uri):
    """Download and extract text from a document"""
    try:
        # Download file from GCS
        bucket_name = gcs_uri.split('/')[2]
        blob_path = '/'.join(gcs_uri.split('/')[3:])
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_path)
        
        # Create temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=blob.name.split('.')[-1]) as temp_file:
            blob.download_to_filename(temp_file.name)
            
            # Extract text based on file type
            if blob.name.lower().endswith('.pdf'):
                text = extract_text_from_pdf(temp_file.name)
            elif blob.name.lower().endswith('.docx'):
                text = extract_text_from_docx(temp_file.name)
            elif blob.name.lower().endswith('.txt'):
                text = extract_text_from_txt(temp_file.name)
            else:
                text = ""
            
            # Clean up
            os.unlink(temp_file.name)
            return text
    except Exception as e:
        print(f"Document text extraction error: {e}")
        return ""

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'cryocord-sales-query',
        'vertex_ai': 'enabled',
        'rag': 'document-based',
        'file_uploads': 'enabled'
    }), 200

@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    """Upload file to knowledge base"""
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
    
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.txt']
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        return jsonify({'error': f'Unsupported file type. Allowed: {", ".join(allowed_extensions)}'}), 400
    
    try:
        bucket = ensure_bucket_exists()
        if not bucket:
            return jsonify({'error': 'Failed to access storage'}), 500
        
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
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/files', methods=['GET'])
def list_files():
    """List all uploaded files"""
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
    """Delete a file"""
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
    """Handle queries with RAG using uploaded documents"""
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
        # Get uploaded documents
        bucket = storage_client.get_bucket(BUCKET_NAME)
        blobs = list(bucket.list_blobs(prefix='uploads/', max_results=10))
        
        # Extract text from documents
        document_contexts = []
        for blob in blobs:
            gcs_uri = f"gs://{BUCKET_NAME}/{blob.name}"
            doc_text = get_document_text(gcs_uri)
            if doc_text:
                # Take first 2000 chars from each document
                document_contexts.append({
                    'source': blob.name.replace('uploads/', ''),
                    'text': doc_text[:2000]
                })
        
        # Build context from documents
        if document_contexts:
            context_text = "\n\n=== KNOWLEDGE BASE DOCUMENTS ===\n\n"
            for i, doc in enumerate(document_contexts, 1):
                context_text += f"Document {i}: {doc['source']}\n{doc['text']}\n\n"
        else:
            context_text = "\n\n=== NO DOCUMENTS UPLOADED YET ===\n"
        
        # Create enhanced prompt with document context
        prompt = f"""You are a CryoCord sales compliance assistant with access to uploaded knowledge base documents.

{context_text}

Customer Question: {question}

Based on the knowledge base documents above, provide:

1. COMPLIANCE SUMMARY (for internal use):
   - Key regulatory considerations from the documents
   - Required disclosures
   - Risk factors to address
   - Recommended talking points

2. CUSTOMER ANSWER (for customer-facing response):
   - Clear, accurate answer based on the knowledge base
   - Compliant language
   - Relevant disclaimers if needed
   - Reference specific documents when applicable

If the documents don't contain relevant information, acknowledge this and provide general guidance.
"""
        
        # Query Gemini with document context
        response = model.generate_content(prompt)
        full_response = response.text
        
        # Parse response
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
            'sources': [doc['source'] for doc in document_contexts],
            'user': user.get('email'),
            'timestamp': datetime.now().isoformat(),
            'documents_used': len(document_contexts)
        }), 200
        
    except Exception as e:
        print(f"Query error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
