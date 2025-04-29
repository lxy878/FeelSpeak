from aiTranslator import run_stream
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import string

def has_punctuation(text):
    # Check if any character in the text is a punctuation mark
    return any(char in string.punctuation for char in text)

def restore_punctuation(text):
    print("Restoring punctuation...")
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
    # Example usage
    text = "とても静かに私は去りました 来た時と同じように静かに私は西の雲に別れを告げました 川辺の黄金の柳は夕焼けの花嫁 波間の美しい影が私の心にさざ波を立てています 柔らかい泥の上の緑の水草は水に油のように揺れています ケム川の柔らかな波の中で 私は水草になりたいです 日陰のプールは澄んだ泉ではなく、空にかかる虹です 浮遊藻に押しつぶされ、虹のような夢を降らせます 夢を探しに私は長い竿を持ち、草がより青いところまで上流に漂います 星の光を満載したボート 星明かりの輝きの中で歌う しかし私は歌うことができません フルートの別れは静かに、夏の虫は私に沈黙しています 今夜のケンブリッジは静寂です とても静かに私は去りました 来た時と同じように静かに私は袖を振りました 雲ひとつ取り去ることなく"
    ch_text = restore_punctuation(text)
    print(ch_text)
    for sentence in run_stream("ja", "en", ch_text, batch_size=8):
        print("Sentence: ",sentence)