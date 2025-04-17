import whisper

def transcribe_audio(file_path):
    # Load the Whisper model
    model = whisper.load_model("base")  # Options: tiny, base, small, medium, large

    # Transcribe the audio file
    result = model.transcribe(file_path)

    # Return the transcription
    return result["text"]

if __name__ == "__main__":
    # Example usage
    file_path = "./test/"
    transcription = transcribe_audio(file_path)
    print(f"Transcription: {transcription}")