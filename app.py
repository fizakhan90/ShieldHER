# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS # To handle cross-origin requests

# --- ML Model Setup ---
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch # Or tensorflow

# Choose a pre-trained model for toxicity/hate speech detection
# 'unitary/toxic-bert' is used here, which provides scores for labels like 'toxic' and 'insult'.
MODEL_NAME = "unitary/toxic-bert"

tokenizer = None
model = None
model_labels = {} # Dictionary to store label index mapping

print(f"Loading model: {MODEL_NAME}...")
try:
    # Load the tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

    # Set model to evaluation mode
    model.eval()

    print(f"Model '{MODEL_NAME}' loaded successfully.")

    # Get the label mapping. Convert tuple list to dictionary for easier lookup
    # Example: {0: 'toxic', 1: 'severe_toxic', 2: 'obscene', 3: 'threat', 4: 'insult', 5: 'identity_hate'}
    # We specifically need the indices for 'toxic' and 'insult' (and potentially others like 'identity_hate')
    if model.config.id2label:
        model_labels = model.config.id2label
        print("Model labels:", model_labels)
    else:
        print("Warning: Model configuration does not contain label mapping (id2label).")
        # Detection might not work correctly without labels

except Exception as e:
    print(f"Error loading model {MODEL_NAME}: {e}")
    print("The detection endpoint will not be available.")
    # Handle error

# --- Detection Function ---
def detect_misogyny(text):
    """
    Analyzes text for potential misogyny using the loaded ML model.
    This version uses a combination of 'toxic' and 'insult' scores.
    """
    if model is None or tokenizer is None or not model_labels:
        print("Model, tokenizer, or labels not loaded. Cannot perform detection.")
        return {"text": text, "is_misogynistic": False, "score_toxic": 0, "score_insult": 0, "error": "Model/Labels not loaded"}

    try:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)

        # Optional: Move to GPU
        # if torch.cuda.is_available():
        #     model.to('cuda')
        #     inputs = {k: v.to('cuda') for k, v in inputs.items()}
        # else:
        #      # Move model back to CPU if it was on GPU for some reason and GPU isn't available now
        #      model.to('cpu')


        with torch.no_grad():
            outputs = model(**inputs)

        probs = torch.sigmoid(outputs.logits)[0] # Get probabilities for the single input text

        # --- Interpreting Model Output using specific labels ---
        # Find indices for the labels we care about ('toxic', 'insult')
        # It's safer to look up the index by label name
        toxic_label_index = next((idx for idx, label in model_labels.items() if label == 'toxic'), -1)
        insult_label_index = next((idx for idx, label in model_labels.items() if label == 'insult'), -1)
        # Add other relevant labels here if needed, e.g., identity_hate

        # Get scores safely based on found indices and probability array length
        toxic_score = probs[toxic_label_index].item() if toxic_label_index != -1 and toxic_label_index < len(probs) else 0
        insult_score = probs[insult_label_index].item() if insult_label_index != -1 and insult_label_index < len(probs) else 0
        # Get other scores here

        # --- Define Thresholds for Combined Interpretation ---
        # !! YOU WILL NEED TO TUNE THESE THRESHOLDS based on testing !!
        # Start with some values and adjust based on your test cases
        THRESHOLD_TOXIC = 0.40     # If the text is generally toxic (score > 0.70)
        THRESHOLD_INSULT = 0.50 # If the text is specifically insulting (score > 0.60)
        # Add thresholds for other scores if used

        # --- Decision Logic ---
        # Combine scores to determine if text is misogynistic.
        # Example Logic: Flag if it's highly toxic OR highly insulting
        is_misogynistic = (toxic_score > THRESHOLD_TOXIC) or (insult_score > THRESHOLD_INSULT)

        # Example of an alternative logic (using a combined weighted score - harder to tune quickly)
        # combined_score_threshold = 0.65 # Example combined threshold
        # combined_score = (toxic_score * 0.6) + (insult_score * 0.4) # Example weights
        # is_misogynistic = combined_score > combined_score_threshold


        # Return the result including individual scores for debugging/tuning
        return {
            "text": text,
            "is_misogynistic": is_misogynistic,
            "score_toxic": toxic_score,
            "score_insult": insult_score,
            # Include other scores here if used in logic
            # "combined_score": combined_score, # If using combined score logic
            # Optional: Include all scores detail again if helpful
            # "scores_detail": {model_labels[i]: probs[i].item() for i in range(len(probs))}
        }

    except Exception as e:
        print(f"Error during detection for text: '{text}' - {e}")
        return {"text": text, "is_misogynistic": False, "score_toxic": 0, "score_insult": 0, "error": f"Detection failed: {e}"}


# --- Flask App Setup (Keep this) ---
app = Flask(__name__)
CORS(app) # Enable CORS

# --- API Endpoint Definition (Keep this) ---
@app.route('/detect', methods=['POST'])
def detect():
    """
    API endpoint to receive text via POST and return detection result.
    Returns JSON body with is_misogynistic flag and individual scores.
    """
    if not request.json or not 'text' in request.json:
        return jsonify({"error": "Invalid input. Provide 'text' in JSON body."}), 400

    text_to_check = request.json['text']
    result = detect_misogyny(text_to_check)

    # Ensure error is included in JSON response if present
    if 'error' in result:
         return jsonify(result), 500 # Indicate server error if detection failed internally
    else:
         return jsonify(result) # Return success response


# Optional: Add a simple root route (Keep this)
@app.route('/')
def index():
    return "Misogyny Detection Backend is running!"

# --- Running the App (Keep this) ---
if __name__ == '__main__':
    print("Starting Flask server...")
    # Ensure model is loaded before running the app if it failed in the try block
    if model is None or tokenizer is None or not model_labels:
        print("Model or Labels failed to load. Server starting but detection endpoint will return errors.")
        # You might want to exit here in production, but for hackathon let server run
        # so you can see error messages via API calls
        # exit(1) # Uncomment to exit if model fails to load

    app.run(debug=True, port=5000) # Run on port 5000