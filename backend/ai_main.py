from voiceToText import convert_to_wav_librosa, transcribe_audio_wav2vec, restore_punctuation
from sentiment import sentinment
from aiTranslator import run_stream

# may need to remove
def run(input_audio="./test/audio.mp3"):
    # Convert audio to WAV format
    output_wav = input_audio.replace(".mp3", ".wav")
    convert_to_wav_librosa(input_audio, output_wav)

    # Transcribe audio to text
    transcription = transcribe_audio_wav2vec(output_wav)
    print(f"Transcription: {transcription}")
    
    # Restore punctuation in the transcription
    # testing in multiple languages
    restore_punctuation_text = restore_punctuation(transcription)
    print(f"Transcription with punctuation: {restore_punctuation_text}")

    # Translation
    yield run_stream(
        lang_from="en",
        lang_to="zh",
        text=restore_punctuation_text
    )

if __name__ == "__main__":
    try:
        # Input audio file path
        run()
    except Exception as e:
        print(f"Error: {e}")