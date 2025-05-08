# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS # To handle cross-origin requests from your Next.js frontend

# --- ML Model Setup ---
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch # Or tensorflow, depending on what you installed

# Choose a pre-trained model for toxicity/hate speech detection
# You might want to experiment with different models from Hugging Face:
# https://huggingface.co/models?library=transformers&sort=downloads&search=toxicity
# 'unitary/toxic-bert' is a common general toxicity model.
# Others like 's-nlp/roberta-base-sentiment' or models fine-tuned on hate speech data might also be relevant.
MODEL_NAME = "unitary/toxic-bert" # Example model

tokenizer = None
model = None

print(f"Loading model: {MODEL_NAME}...")
try:
    # Load the tokenizer and model from Hugging Face Hub
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

    # Set model to evaluation mode (important for inference)
    model.eval()

    print(f"Model '{MODEL_NAME}' loaded successfully.")

    # Get the label mapping from the model's configuration
    # This tells you what each output score corresponds to (e.g., toxic, insult, etc.)
    # This is CRITICAL for understanding the model's output
    model_labels = model.config.id2label
    print("Model labels:", model_labels)
    # Note the index for 'toxic' or other relevant labels here!
    # e.g., if model_labels looks like {0: 'toxic', 1: 'severe_toxic', ...}

except Exception as e:
    print(f"Error loading model {MODEL_NAME}: {e}")
    print("The detection endpoint will not be available.")
    # You might want to add more robust error handling here

# --- Detection Function ---
def detect_misogyny(text):
    """
    Analyzes text for potential misogyny using the loaded ML model.
    Note: This uses a general toxicity model and a simple threshold.
    More sophisticated methods might analyze specific label scores (like 'insult')
    or use a model fine-tuned specifically for misogyny if available.
    """
    if model is None or tokenizer is None:
        print("Model or tokenizer not loaded, cannot perform detection.")
        return {"text": text, "is_misogynistic": False, "score": 0, "error": "Model not loaded"}

    try:
        # Tokenize the input text
        # truncation=True cuts text if it's too long for the model
        # padding=True pads shorter texts
        # return_tensors="pt" requests PyTorch tensors
        # return_tensors="tf" requests TensorFlow tensors if you used TensorFlow
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)

        # Move inputs to GPU if available (optional, can speed up inference)
        # if torch.cuda.is_available():
        #     model.to('cuda')
        #     inputs = {k: v.to('cuda') for k, v in inputs.items()}

        # Perform inference
        with torch.no_grad(): # Disable gradient calculation for inference
            outputs = model(**inputs)

        # Get the probabilities. Sigmoid is used because this is often a multi-label classification model
        # (text can be both toxic and obscene, for example)
        probs = torch.sigmoid(outputs.logits)[0] # Get probabilities for the first (and only) input text

        # --- Interpreting Model Output ---
        # This is the most crucial part you might need to tune!
        # The 'toxic-bert' model outputs scores for 'toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate'.
        # You need to decide which scores indicate potential misogyny.
        # A simple approach is to use the general 'toxic' score.
        # Let's find the index for 'toxic' based on the model's labels
        toxic_label_index = -1
        for idx, label in model_labels.items():
            if label == 'toxic':
                toxic_label_index = idx
                break

        toxic_score = 0
        if toxic_label_index != -1 and toxic_label_index < len(probs):
             toxic_score = probs[toxic_label_index].item() # Get the score for 'toxic' and convert to Python number
        else:
             print(f"Warning: 'toxic' label not found or index out of range for model '{MODEL_NAME}'. Cannot get toxic score.")
             # Fallback or error handling if the expected label isn't there

        # Define a threshold. You will NEED to test and tune this threshold!
        # A higher threshold means fewer false positives but more false negatives.
        # A lower threshold means more false positives but fewer false negatives.
        THRESHOLD = 0.7 # Example: Flag if the 'toxic' score is above 70% probability

        is_misogynistic = toxic_score > THRESHOLD

        # Return the result
        return {
            "text": text,
            "is_misogynistic": is_misogynistic,
            "score": toxic_score,
            # Optional: Return all scores for debugging/detail
            # "scores_detail": {model_labels[i]: probs[i].item() for i in range(len(probs))}
        }

    except Exception as e:
        print(f"Error during detection for text: '{text}' - {e}")
        # Return a safe default or error state if detection fails
        return {"text": text, "is_misogynistic": False, "score": 0, "error": f"Detection failed: {e}"}


# --- Flask App Setup ---
app = Flask(__name__)
# Enable CORS so your Next.js frontend running on a different port can access this backend
# For a hackathon, allowing all origins (*) is usually fine, but be cautious in production.
CORS(app)

# --- API Endpoint Definition ---
@app.route('/detect', methods=['POST'])
def detect():
    """
    API endpoint to receive text via POST request and return detection result.
    Expects JSON body like: {"text": "Your input text here"}
    Returns JSON body like: {"text": ..., "is_misogynistic": true/false, "score": ...}
    """
    # Check if the request body is JSON and contains the 'text' key
    if not request.json or not 'text' in request.json:
        return jsonify({"error": "Invalid input. Please send a JSON body with a 'text' key."}), 400 # Bad Request

    text_to_check = request.json['text']

    # Call the detection function
    result = detect_misogyny(text_to_check)

    # Return the result as JSON
    return jsonify(result)

# Optional: Add a simple root route to check if the server is running
@app.route('/')
def index():
    return "Misogyny Detection Backend is running!"

# --- Running the App ---
if __name__ == '__main__':
    # This block only runs when the script is executed directly (not imported)
    # app.run starts the Flask development server
    # debug=True provides helpful error pages and auto-reloads on code changes
    # port=5000 sets the server to run on port 5000 (you can change this)
    print("Starting Flask server...")
    app.run(debug=True, port=5000)