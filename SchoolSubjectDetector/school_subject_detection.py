import torch
import numpy as np
from transformers import BertTokenizer, BertForSequenceClassification

label_dict = {
    'Matemáticas': 0, 
    'Física y química': 1, 
    'Geografía': 2, 
    'Historia': 3, 
    'Idiomas extranjeros': 4, 
    'Artes': 5,
    'Educación física': 6, 
    'Lengua y literatura': 7, 
    'Frase no relacionada con asignaturas': 8, 
    'Religión': 9}

device = torch.device("cuda") if torch.cuda.is_available() else "cpu"

tokenizer = BertTokenizer.from_pretrained("dccuchile/bert-base-spanish-wwm-uncased")
model     = BertForSequenceClassification.from_pretrained("dccuchile/bert-base-spanish-wwm-uncased",
                                                      num_labels=len(label_dict),
                                                      output_attentions=False,
                                                      output_hidden_states=False)
model.to(device)
model.load_state_dict(torch.load('../notebook_and_models/best_finetuned_BETO.model', map_location=device), strict=True)
model.eval()

id2label = {v: k for k, v in label_dict.items()}

def ss_detector(text_to_analyze):
    """
    Function to detect school subject from input text, using the fine-tuned BETO model.

    Args:
        text_to_analyze (str): Input text in Spanish.
    """
    encoded_input = tokenizer.encode_plus(
        text_to_analyze,
        add_special_tokens=True,
        return_tensors='pt',
        max_length=128,
        padding='max_length',
        truncation=True
    )

    input_ids = encoded_input['input_ids'].to(device)
    attention_mask = encoded_input['attention_mask'].to(device)

    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs.logits

    probs = torch.nn.functional.softmax(logits, dim=1)
    probs_np = probs.detach().cpu().numpy()[0]

    predicted_class_id = np.argmax(probs_np)
    predicted_class = id2label[predicted_class_id]

    result = {
        'predicted_class': predicted_class,
        'class_probabilities': {id2label[i]: float(probs_np[i]) for i in range(len(probs_np))}
    }

    return result