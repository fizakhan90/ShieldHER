from flask import Flask, request, jsonify
from flask_cors import CORS


from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch 

MODEL_NAME = "annahaz/xlm-roberta-base-misogyny-sexism-indomain-mix-bal"

tokenizer = None
model = None
model_labels = {} 


misogynisticStatistics_data = [
    {
        "title": "Online Harassment",
        "value": "73%",
        "source": "Pew Research Center",
        "info": "of women have experienced some form of online harassment, with women being twice as likely as men to experience sexual harassment online.",
        "impact": "This means that most women you know have likely faced harassment simply for existing online.",
        "action": "Think about how your words might contribute to this experience."
    },
    {
        "title": "Mental Health Impact",
        "value": "51%",
        "source": "Women's Media Center",
        "info": "of women who experienced online abuse reported suffering from stress, anxiety, or panic attacks as a result.",
        "impact": "Words online can cause real psychological harm that affects daily life.",
        "action": "Consider: would you say this to someone's face knowing it might cause them anxiety?"
    },
    {
        "title": "Professional Consequences",
        "value": "38%",
        "source": "Amnesty International",
        "info": "of women who experienced online abuse reported self-censoring their online posts to avoid harassment, limiting their professional visibility.",
        "impact": "This silencing effect means important voices are missing from online conversations.",
        "action": "Your words could be preventing someone from sharing their expertise or perspective."
    },
    {
        "title": "Platform Response",
        "value": "27%",
        "source": "UN Women",
        "info": "of women who reported online abuse said platforms took action against their abusers, highlighting the gap in protection mechanisms.",
        "impact": "With limited platform protection, individual behavior change is crucial for safer spaces.",
        "action": "You can be part of the solution by choosing respectful language."
    }
]


print(f"Loading model: {MODEL_NAME}...")
try:
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

    
    model.eval()

    print(f"Model '{MODEL_NAME}' loaded successfully.")

    
    if model.config.id2label:
        model_labels = model.config.id2label
        print("Model labels:", model_labels)
        if set(model_labels.values()) != {'0', '1'}:
             print("Warning: Model labels are not '0' and '1'. Detection logic may fail.")
             model_labels = {} 
    else:
        print("Warning: Model configuration does not contain label mapping (id2label). Cannot interpret results.")
        model_labels = {} 

except Exception as e:
    print(f"Error loading model {MODEL_NAME}: {e}")
    print("The detection endpoint will not be available.")
   
def detect_misogyny(text):
    """
    Analyzes text for potential misogyny using the loaded ML model.
    This version uses a binary classification model predicting '0' or '1'.
    """
  
    if model is None or tokenizer is None or not model_labels or (set(model_labels.values()) != {'0', '1'}):
        print("Model, tokenizer, or expected binary labels not loaded. Cannot perform detection.")
        return {"text": text, "is_misogynistic": False, "score_misogyny": 0, "error": "Model/Labels not loaded or unexpected labels"}

    
    lower_text = text.lower()
    if "typical women driver" in lower_text or "woman driver" in lower_text:
        return {
            "text": text,
            "is_misogynistic": True,
            "score_misogyny": 1.0, 
            "rule_applied": "misogynistic_stereotype",
            "error": None
        }
   


    try:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)

        probs = torch.softmax(outputs.logits, dim=1)[0] 
        target_label_index = next((idx for idx, label in model_labels.items() if label == target_label_name), -1)

        score = 0 
        if target_label_index != -1 and target_label_index < len(probs):
             score = probs[target_label_index].item() 
        else:
            
             print(f"Warning: Target label '{target_label_name}' not found in model labels during inference.")

             return {"text": text, "is_misogynistic": False, "score_misogyny": 0, "error": f"Internal: Target label '{target_label_name}' not found."}


        
        THRESHOLD = 0.5 

    
        is_misogynistic = score > THRESHOLD

        
        return {
            "text": text,
            "is_misogynistic": is_misogynistic,
            "score_misogyny": score, 
            "rule_applied": None, 
            "error": None
        }

    except Exception as e:
        print(f"Error during detection for text: '{text}' - {e}")
        return {"text": text, "is_misogynistic": False, "score_misogyny": 0, "error": f"Detection failed: {e}"}


app = Flask(__name__)

CORS(app)


@app.route('/detect', methods=['POST'])
def detect():
    """
    API endpoint to receive text via POST request and return detection result.
    Expects JSON body like: {"text": "Your input text here"}
    Returns JSON body like: {"text": ..., "is_misogynistic": true/false, "score_misogyny": ..., "error": ...}
    """
    
    if not request.json or not 'text' in request.json:
        return jsonify({"error": "Invalid input. Provide 'text' in JSON body."}), 400 

    text_to_check = request.json['text']

    
    result = detect_misogyny(text_to_check)

    return jsonify(result), 200





@app.route('/')
def index():
    return "Misogyny Detection Backend is running! Endpoints: /detect (POST), /statistics (GET)"

if __name__ == '__main__':
    print("Starting Flask server...")
    
    if model is None or tokenizer is None or not model_labels or (set(model_labels.values()) != {'0', '1'}):
        print("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("!! WARNING: MODEL LOADING FAILED OR LABELS ARE UNEXPECTED. !!")
        print("!! THE /detect ENDPOINT WILL RETURN ERRORS.                !!")
        print("!! Check error messages above and ensure model is accessible.!!")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n")
        
    else:
        print("Model loaded successfully and labels are as expected ('0', '1').")
        
    app.run(debug=True, port=5000)