from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import auth, credentials
from google.cloud import storage, aiplatform
import vertexai
from vertexai.preview import rag
from vertexai.generative_models import GenerativeModel
import os
import tempfile
from datetime import datetime
import json

# Initialize Flask
app = Flask(__name__)

# Enable CORS for your Firebase URLs
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

# Configuration
PROJECT_ID = 'cryocord-ai-platform'
LOCATION = 'us-central1'
BUCKET_NAME = f'{PROJECT_ID}-rag-docs'
RAG_CORPUS_NAME = 'cryocord-sales-corpus'

# Initialize Firebase Admin
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'projectId': PROJECT_ID
})

# Initialize Vertex AI
vertexai.init(project=PROJECT_ID, location=LOCATION)
aiplatform.init(project=PROJECT_ID, location=LOCATION)

# Initialize Cloud Storage
storage_client = storage.Client()

# Global variables
rag_corpus = None
model = GenerativeModel('gemini-1.5-flash')

def verify_firebase_token():
    """Verify Firebase ID token from request"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, 'Missing or invalid Authorization header'
    
    id_token = auth_header.split('Bearer ')[1]
    
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token, None
    except Exception as e:
        return None, str(e)

def ensure_bucket_exists():
    """Create storage bucket if it doesn't exist"""
    try:
        bucket = storage_client.get_bucket(BUCKET_NAME)
        print(f"Bucket {BUCKET_NAME} already exists")
        return bucket
    except:
        bucket = storage_client.create_bucket(BUCKET_NAME, location=LOCATION)
        print(f"Created bucket {BUCKET_NAME}")
        return bucket

def get_or_create_rag_corpus():
    """Get existing RAG corpus or create new one"""
    global rag_corpus
    
    if rag_corpus:
        return rag_corpus
    
    try:
        # Try to get existing corpus
        corpus_name = f"projects/{PROJECT_ID}/locations/{LOCATION}/ragCorpora/{RAG_CORPUS_NAME}"
        rag_corpus = rag.get_corpus(name=corpus_name)
        print(f"Found existing RAG corpus: {RAG_CORPUS_NAME}")
        return rag_corpus
    except:
        # Create new corpus
        try:
            rag_corpus = rag.create_corpus(
                display_name=RAG_CORPUS_NAME,
                description="CryoCord sales compliance knowledge base"
            )
            print(f"Created new RAG corpus: {RAG_CORPUS_NAME}")
            return rag_corpus
        except Exception as e:
            print(f"Error creating RAG corpus: {e}")
            return None

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'cryocord-sales-query',
        'vertex_rag': 'enabled'
    }), 200

@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    """Upload file to knowledge base"""
    
    if request.method == 'OPTIONS':
        return '', 200
    
    # Verify authentication
    user, error = verify_firebase_token()
    if error:
        return jsonify({'error': error}), 401
    
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Get file metadata
    file_type = request.form.get('type', 'document')
    description = request.form.get('description', '')
    
    try:
        # Ensure bucket exists
        bucket = ensure_bucket_exists()
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_filename = f"{timestamp}_{file.filename}"
        
        # Upload to Cloud Storage
        blob = bucket.blob(f"uploads/{safe_filename}")
        blob.upload_from_file(file)
        
        # Get or create RAG corpus
        corpus = get_or_create_rag_corpus()
        if not corpus:
            return jsonify({'error': 'Failed to initialize RAG corpus'}), 500
        
        # Import file into RAG corpus
        gcs_uri = f"gs://{BUCKET_NAME}/uploads/{safe_filename}"
        
        # Import file to RAG
        rag_file = rag.import_files(
            corpus_name=corpus.name,
            paths=[gcs_uri],
            chunk_size=512,
            chunk_overlap=100
        )
        
        return jsonify({
            'success': True,
            'filename': safe_filename,
            'gcs_uri': gcs_uri,
            'type': file_type,
            'description': description,
            'uploaded_by': user.get('email', 'unknown'),
            'timestamp': timestamp
        }), 200
        
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/files', methods=['GET'])
def list_files():
    """List all uploaded files"""
    
    # Verify authentication
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
                'updated': blob.updated.isoformat(),
                'contentType': blob.content_type
            })
        
        return jsonify({
            'files': files,
            'count': len(files)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/files/<filename>', methods=['DELETE'])
def delete_file(filename):
    """Delete a file from knowledge base"""
    
    # Verify authentication
    user, error = verify_firebase_token()
    if error:
        return jsonify({'error': error}), 401
    
    try:
        bucket = storage_client.get_bucket(BUCKET_NAME)
        blob = bucket.blob(f'uploads/{filename}')
        blob.delete()
        
        return jsonify({
            'success': True,
            'message': f'File {filename} deleted',
            'deleted_by': user.get('email', 'unknown')
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['POST', 'OPTIONS'])
def sales_query():
    """Handle sales queries with RAG-enhanced responses"""
    
    if request.method == 'OPTIONS':
        return '', 200
    
    # Verify authentication
    user, error = verify_firebase_token()
    if error:
        return jsonify({'error': error}), 401
    
    # Get question
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({'error': 'Missing question in request body'}), 400
    
    question = data['question'].strip()
    if not question:
        return jsonify({'error': 'Question cannot be empty'}), 400
    
    try:
        # Get or create RAG corpus
        corpus = get_or_create_rag_corpus()
        
        if not corpus:
            # Fallback to basic Gemini without RAG
            return fallback_query(question, user)
        
        # Query with RAG
        response = rag.retrieval_query(
            rag_resources=[
                rag.RagResource(
                    rag_corpus=corpus.name,
                )
            ],
            text=question,
            similarity_top_k=5,
            vector_distance_threshold=0.5,
        )
        
        # Extract retrieved contexts
        contexts = []
        if hasattr(response, 'contexts'):
            for context in response.contexts.contexts[:3]:  # Top 3 contexts
                contexts.append({
                    'text': context.text[:500],  # First 500 chars
                    'source': context.source_uri if hasattr(context, 'source_uri') else 'unknown'
                })
        
        # Create enhanced prompt with RAG context
        rag_context = "\n\n".join([f"Context {i+1}:\n{c['text']}" for i, c in enumerate(contexts)])
        
        enhanced_prompt = f"""
You are a CryoCord sales compliance assistant. Use the following knowledge base context to answer the customer's question.

KNOWLEDGE BASE CONTEXT:
{rag_context}

CUSTOMER QUESTION:
{question}

Please provide:

1. COMPLIANCE SUMMARY (for internal use):
   - Key regulatory considerations
   - Required disclosures based on the knowledge base
   - Risk factors to address
   - Recommended talking points

2. CUSTOMER ANSWER (for customer-facing response):
   - Clear, accurate answer based on the knowledge base
   - Compliant language
   - Relevant disclaimers if needed

If the knowledge base doesn't contain relevant information, acknowledge this and provide general guidance.
"""
        
        # Query Gemini with enhanced prompt
        gemini_response = model.generate_content(enhanced_prompt)
        full_response = gemini_response.text
        
        # Parse response
        if "COMPLIANCE SUMMARY:" in full_response and "CUSTOMER ANSWER:" in full_response:
            parts = full_response.split("CUSTOMER ANSWER:")
            compliance_part = parts[0].replace("COMPLIANCE SUMMARY:", "").strip()
            customer_part = parts[1].strip()
        else:
            compliance_part = "Review required: Check response format"
            customer_part = full_response
        
        return jsonify({
            'complianceSummary': compliance_part,
            'customerAnswer': customer_part,
            'sources': contexts,
            'user': user.get('email', 'unknown'),
            'timestamp': datetime.now().isoformat(),
            'rag_enabled': True
        }), 200
        
    except Exception as e:
        print(f"RAG query error: {e}")
        # Fallback to basic query
        return fallback_query(question, user)

def fallback_query(question, user):
    """Fallback query without RAG"""
    try:
        basic_prompt = f"""
You are a CryoCord sales compliance assistant.

Customer Question: {question}

Provide:
1. COMPLIANCE SUMMARY (internal notes)
2. CUSTOMER ANSWER (customer-facing response)
"""
        
        response = model.generate_content(basic_prompt)
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
            'user': user.get('email', 'unknown'),
            'timestamp': datetime.now().isoformat(),
            'rag_enabled': False,
            'note': 'RAG not available, using basic model'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
