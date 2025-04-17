from flask import Flask, request, jsonify
from google.cloud import storage
import os

app = Flask(__name__)

# Configure Google Cloud Storage
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "path/to/your-service-account-key.json"
BUCKET_NAME = "your-bucket-name"

# Initialize Google Cloud Storage client
storage_client = storage.Client()
bucket = storage_client.bucket(BUCKET_NAME)

@app.route('/uploadRecording', methods=['POST'])
def upload_recording():
    try:
        # Check if the request contains a file
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Save the file to Google Cloud Storage
        blob = bucket.blob(audio_file.filename)
        blob.upload_from_file(audio_file)
        blob.make_public()  # Optional: Make the file publicly accessible

        return jsonify({
            "message": "Recording uploaded successfully",
            "file_url": blob.public_url
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/listRecordings', methods=['GET'])
def list_recordings():
    try:
        # List all files in the bucket
        blobs = bucket.list_blobs()
        recordings = [{"name": blob.name, "url": blob.public_url} for blob in blobs]

        return jsonify({"recordings": recordings}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)