from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import load_dataset

#  27 emotions

# may remove it
# Load dataset and tokenizer
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=27)

# Tokenize dataset
def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True)

def dataset_preprocessing():
    raw_datasets = load_dataset("emotion")  # Example dataset
    raw_datasets["train"] = raw_datasets["train"].select(range(5000))  # First 1000 samples
    raw_datasets["validation"] = raw_datasets["validation"].select(range(2000))  # First 200 samples
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
        num_train_epochs=1,  # Reduce to 1 epoch
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

    # Save the final model and tokenizer
    model.save_pretrained("./results/final_model")
    tokenizer.save_pretrained("./results/final_model")

if __name__ == "__main__":
    main()