import torch
from transformers import pipeline

def predict_emotion(text, model, tokenizer, device, emotion_labels=None):
    # Tokenize the input text
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)

    # Perform inference
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_class = torch.argmax(logits, dim=-1).item()

    # Map the predicted class to the emotion label
    return emotion_labels[predicted_class]

classifier = pipeline("zero-shot-classification", model="joeddav/xlm-roberta-large-xnli", device=0 if torch.cuda.is_available() else -1)

# Define the 27 emotions
emotions = [
    "admiration", "amusement", "anger", "annoyance", "approval", "caring", "confusion",
    "curiosity", "desire", "disappointment", "disapproval", "disgust", "embarrassment",
    "excitement", "fear", "gratitude", "grief", "joy", "love", "nervousness", "optimism",
    "pride", "realization", "relief", "remorse", "sadness", "surprise"
]

def sentiment_real_time(sentences=[]):
    """
    Perform real-time sentiment analysis for a list of sentences.
    Yields the sentiment result for each sentence as soon as it's processed.
    """
    for sentence in sentences:
        try:
            # Perform sentiment analysis for the current sentence
            result = classifier(sentence, emotions, multi_label=True)
            highest_emotion_index = result["scores"].index(max(result["scores"]))  # Get index of the highest score
            highest_emotion = result["labels"][highest_emotion_index]  # Get the corresponding emotion label
            emotion_index = emotions.index(highest_emotion)  # Get the index of the emotion
            # Yield the result for the current sentence
            yield {"sentence": sentence, "emotion_index": emotion_index}
        except Exception as e:
            # Yield an error result if something goes wrong
            yield {"sentence": sentence, "error": str(e)}


if __name__ == "__main__":
    try:
        # Input audio file path
        sentiment()
    except Exception as e:
        print(f"Error: {e}")