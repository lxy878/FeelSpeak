from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
import re

# Todo: advance the sentence ending to handle multiple languages
# Load the model and tokenizer only once to avoid reloading every time

model = M2M100ForConditionalGeneration.from_pretrained("facebook/m2m100_418M")
tokenizer = M2M100Tokenizer.from_pretrained("facebook/m2m100_418M")

def split_sentences(text):
    """Split text into sentences using regex."""
    sentence_endings = r"[.!?。！？]"
    sentences = re.split(f"({sentence_endings})", text)
    # Combine the sentence fragments (e.g., "Hello" + "." -> "Hello.")
    sentences = ["".join(pair).strip() for pair in zip(sentences[0::2], sentences[1::2])]
    return [s for s in sentences if s.strip()]  # Remove empty strings

def run(lang_from="en", lang_to="zh", text="Hello, how are you?", batch_size=8):

    # Set the source and target languages
    tokenizer.src_lang = lang_from

    # Split the input text into sentences
    sentences = split_sentences(text)

     # Translate each sentence and combine the results
    translations = []
    for i in range(0, len(sentences), batch_size):
        batch = sentences[i:i + batch_size]
        try:
            encoded_text = tokenizer(batch, return_tensors="pt", padding=True, truncation=True)
            generated_tokens = model.generate(
                **encoded_text,
                forced_bos_token_id=tokenizer.get_lang_id(lang_to),
                max_length=256,
                num_beams=1,
                early_stopping=True
            )
            translations.extend(tokenizer.decode(t, skip_special_tokens=True) for t in generated_tokens)
        except Exception as e:
            print(f"Error translating sentence: {batch}\n{e}")
            translations.extend([f"Error: {e}" for _ in batch])

    # Combine all translated chunks
    return {"source": sentences, "translation": translations}

def run_stream(lang_from="en", lang_to="zh", text="Hello, how are you?", batch_size=8):
    """Stream translations and sentiments sentence by sentence."""
    tokenizer.src_lang = lang_from
    sentences = split_sentences(text)

    for i in range(0, len(sentences), batch_size):
        batch = sentences[i:i + batch_size]
        try:
            # Translate the batch
            encoded_text = tokenizer(batch, return_tensors="pt", padding=True, truncation=True)
            generated_tokens = model.generate(
                **encoded_text,
                forced_bos_token_id=tokenizer.get_lang_id(lang_to),
                max_length=256,
                num_beams=1,
                early_stopping=True
            )
            translations = [tokenizer.decode(t, skip_special_tokens=True) for t in generated_tokens]
            # Yield results for each sentence in the batch
            for src, trans in zip(batch, translations):
                yield {"source": src, "translation": trans}
        except Exception as e:
            print(f"Error processing batch: {batch}\n{e}")
            for src in batch:
                yield {"source": src, "translation": f"Error: {e}"}


if __name__ == "__main__":
    with open("../assets/text.txt", "r", encoding="utf-8") as f:
        text = f.read().strip()    
    print("\nEnglish Text: ", f'{text}\n')
    # print("Chinese Text: ", result)
    for result in run_stream(text=text):
        print(f"Source: {result['source']}")
        print(f"Translation: {result['translation']}\n")