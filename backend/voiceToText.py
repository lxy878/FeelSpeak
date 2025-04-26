from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor, AutoTokenizer, AutoModelForTokenClassification, pipeline
import torch
import soundfile as sf
import librosa

def convert_to_wav_librosa(input_file, output_file):
    audio, sr = librosa.load(input_file, sr=None)
    target_sr = 16000
    if sr != target_sr:
        audio = librosa.resample(audio, orig_sr=sr, target_sr=target_sr)
        sr = target_sr
    sf.write(output_file, audio, sr)

def transcribe_audio_wav2vec(file_path):
    processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
    model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-base-960h")
    audio_input, sample_rate = sf.read(file_path)
    input_values = processor(audio_input, sampling_rate=sample_rate, return_tensors="pt").input_values
    logits = model(input_values).logits
    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.decode(predicted_ids[0])
    return transcription

def restore_punctuation(text):
    print(f"Input to punctuation model: {text}")  # Debugging
    tokenizer = AutoTokenizer.from_pretrained("oliverguhr/fullstop-punctuation-multilang-large")
    model = AutoModelForTokenClassification.from_pretrained("oliverguhr/fullstop-punctuation-multilang-large")
    punctuator = pipeline("token-classification", model=model, tokenizer=tokenizer, aggregation_strategy="simple")
    punctuated_tokens = punctuator(text.lower())
    punctuated_text = ""
    for token in punctuated_tokens:
        word = token["word"]
        # Append punctuation marks directly to the preceding word
        if token["entity_group"] in [".", ",", "!", "?", ";", ":"]:
            punctuated_text = punctuated_text.rstrip() + " "+ word + token["entity_group"]
        else:
            punctuated_text += " " + word

    return punctuated_text.strip()

if __name__ == "__main__":
    try:
        file_path = "./test/audio.mp3"
        output_wav_path = "./test/audio.wav"
        convert_to_wav_librosa(file_path, output_wav_path)
        transcription = transcribe_audio_wav2vec(output_wav_path)
        print(f"Transcription: {transcription}")
        transcription_punc = restore_punctuation(transcription)
        print(f"Transcription with punctuation: {transcription_punc}")
    except Exception as e:
        print(f"Error: {e}")
