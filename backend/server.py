from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from langdetect import detect
import aiTranslator as at
import string
import requests
from sentiment import sentiment_real_time
from ai_punctuation import restore_punctuation, has_punctuation

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

@socketio.on("start_sentiment")
def sentiment_stream(data):
    sentences = data.get("sentences", [])
    if not sentences:
        emit("error", {"message": "No sentences provided"})
        return

    # Stream sentiment results in real-time
    for result in sentiment_real_time(sentences):
        print(result)
        emit("sentiment", result)

    # Notify the client that sentiment analysis is complete
    emit("sentiment_complete", {"message": "Sentiment analysis complete"})

@app.route("/translate", methods=["POST"])
def translate():
    data = request.json
    text = data.get("text", "")
    lang_from = data.get("lang_from", detect(text))  # Detect language if not provided
    lang_to = data.get("lang_to", "en")
    sentences = at.run(lang_from=lang_from, lang_to=lang_to, text=text)
    print(f'Translation Done')
    return jsonify(sentences)

@socketio.on("start_translation")
def translate_stream(data):
    text = data.get("text", "")
    lang_from = data.get("lang_from", detect(text))
    lang_to = data.get("lang_to", "en")
    
    if not has_punctuation(text):
        # If the text is recorded, we need to restore punctuation
        text = restore_punctuation(text)
        print(f'Punctuation Restoration Done')
    print(f'Stream Translation Started')

    # Stream translations sentence by sentence
    for result in at.run_stream(lang_from=lang_from, lang_to=lang_to, text=text):
        print(result)
        emit("translation", result)  # Send each translation to the client
    emit("translation_complete", {"message": "Translation complete"})  # Notify when done

@socketio.on("voice_translation")
def voice_translation(data):
    audio_file = data.get("audio_file", None)
    if audio_file:
        # Process the audio file and perform translation
        # This is a placeholder for the actual implementation
        print(f'Voice Translation Started')
        # Here you would convert the audio to text, translate it, and send back the result
        emit("translation", {"message": "Voice translation result"})
    else:
        emit("error", {"message": "No audio file provided"})

@app.route("/dictionary", methods=["GET"])
def dictionary():
    data = request.args
    word = data.get("word", "")
    # Remove punctuation from the word
    word = word.translate(str.maketrans("", "", string.punctuation))
    print(f'Fetching dictionary for word: {word}')
    lang_to = data.get("lang_to", "en")
    lang_from = data.get("lang_from", "en")
    format = {
        "word": "...", 
        "definition": "...",
        "lang_from": "...", 
        "lang_to": "...", 
        "translation": ["...","..."]
    }
    
    key= "AIzaSyDje-PZD58qUnELYR_-QPQLVjl7rhdGIho"
    url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={key}'
    response = requests.post(url,headers={'Content-Type': 'application/json'}, json={
        "contents": [{
            "parts": [{"text": f'the definition of word \'{word}\' must be in {lang_from} and translation must be in {lang_to}. use the format: {format} only.'}],
        }]
    })

    response_json = response.json()
    json = response_json['candidates'][0]["content"]["parts"][0]["text"]
    
    return jsonify({"json": json.replace("```", "").strip("json").strip("\n")})  # Return the API response as JSON

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
