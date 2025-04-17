from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import load_dataset

#  27 emotions

# Load dataset and tokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=27)

# Tokenize dataset
def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True)

def dataset_preprocessing():
    raw_datasets = load_dataset("emotion")  # Example dataset

    tokenized_train_dataset = raw_datasets["train"].map(tokenize_function, batched=True)
    tokenized_eval_dataset = raw_datasets["validation"].map(tokenize_function, batched=True)
    return tokenized_train_dataset, tokenized_eval_dataset

def main():
    tokenized_train_dataset, tokenized_eval_dataset = dataset_preprocessing()

    # Define training arguments
    training_args = TrainingArguments(
        output_dir="./results",
        evaluation_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=16,
        num_train_epochs=3,
        weight_decay=0.01,
    )

    # Train the model
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train_dataset,
        eval_dataset=tokenized_eval_dataset,
    )
    trainer.train()

if __name__ == "__main__":
    main()