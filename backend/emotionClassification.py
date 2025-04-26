from transformers import pipeline

# may need to remove
def detect_emotion(text):
    # Load pre-trained emotion classification pipeline
    classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")
    result = classifier(text)[0]
    # Extract emotion and confidence score
    emotion = result['label']  # e.g., "joy", "anger", "sadness"
    confidence = result['score']

    return emotion, confidence

if __name__ == "__main__":
    # Example usage
    text = "I feel so well about the situation."
    emotion, confidence = detect_emotion(text)
    print(f"Emotion: {emotion}, Confidence: {confidence:.2f}")
    # Output: Emotion: anger, Confidence: 0.95