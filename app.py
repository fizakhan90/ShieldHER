# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch # Assuming you are using PyTorch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# --- Configuration ---
# Choose the new model specifically fine-tuned for misogyny/sexism detection
MODEL_NAME = "annahaz/xlm-roberta-base-misogyny-sexism-indomain-mix-bal"

# --- Global Variables ---
tokenizer = None
model = None
model_labels = {} # Dictionary to store label index mapping

# --- Statistics data for impact section (Used by the /statistics endpoint) ---
# Define the data structure (matching your frontend interface)
# Icons are JSX, which cannot be sent over API. Frontend adds them.
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


# --- Model Loading ---
print(f"Loading model: {MODEL_NAME}...")
try:
    # Load the tokenizer and model from Hugging Face Hub
    # If it's gated and you used hf-cli login, the library should find your token.
    # If still issues, try passing token=HF_TOKEN directly (less secure for production).
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

    # Set model to evaluation mode
    model.eval()

    print(f"Model '{MODEL_NAME}' loaded successfully.")

    # Get the label mapping. This model has '0' and '1'.
    # We need to determine which one corresponds to the negative class (misogyny).
    # Typical binary classification maps 0 to negative, 1 to positive.
    # We will ASSUME '1' corresponds to 'misogyny'. Test this assumption!
    if model.config.id2label:
        model_labels = model.config.id2label
        print("Model labels:", model_labels)
        # Basic check for expected binary labels
        if set(model_labels.values()) != {'0', '1'}:
             print("Warning: Model labels are not '0' and '1'. Detection logic may fail.")
             model_labels = {} # Invalidate labels if unexpected format
    else:
        print("Warning: Model configuration does not contain label mapping (id2label). Cannot interpret results.")
        model_labels = {} # Invalidate labels

except Exception as e:
    print(f"Error loading model {MODEL_NAME}: {e}")
    print("The detection endpoint will not be available.")
    # Handle error - model and tokenizer will remain None


# --- Detection Function ---
def detect_misogyny(text):
    """
    Analyzes text for potential misogyny using the loaded ML model.
    This version uses a binary classification model predicting '0' or '1'.
    """
    # Check if model loaded AND has the expected binary labels
    if model is None or tokenizer is None or not model_labels or (set(model_labels.values()) != {'0', '1'}):
        print("Model, tokenizer, or expected binary labels not loaded. Cannot perform detection.")
        # Return structure must match frontend interface (single score)
        return {"text": text, "is_misogynistic": False, "score_misogyny": 0, "error": "Model/Labels not loaded or unexpected labels"}

    # --- Rule-Based Overrides (Keep these if you added them) ---
    # These rules guarantee a flag for specific phrases regardless of model score
    lower_text = text.lower()
    # Example rules based on your testing results
    if "typical women driver" in lower_text or "woman driver" in lower_text:
         # Return structure must match frontend interface (single score)
        return {
            "text": text,
            "is_misogynistic": True,
            "score_misogyny": 1.0, # Assign max score for rule match
            "rule_applied": "misogynistic_stereotype",
            "error": None
        }
    elif "she's just a pretty face" in lower_text: # Added rule
         return {
            "text": text, "is_misogynistic": True, "score_misogyny": 1.0,
            "rule_applied": "objectification_stereotype", "error": None
        }
    elif "look at her outfit, she's asking for it" in lower_text: # Added rule
         return {
            "text": text, "is_misogynistic": True, "score_misogyny": 1.0,
            "rule_applied": "victim_blaming", "error": None
        }
    # Add other specific phrases here if needed based on testing...


    # --- Define Target Label and Threshold ---
    # Assume '1' is the label for the positive class (misogyny/sexism) - VERIFIED by your tests
    target_label_name = '1'

    # Define a single threshold for the score of the target label ('1').
    # !! TUNE THIS THRESHOLD using phrases where the score ISN'T near 0 or 1 !!
    # Start with 0.5, then adjust based on results for phrases with scores between ~0.2 and ~0.8
    THRESHOLD = 0.5 # <<< TUNE YOUR THRESHOLD HERE based on testing OTHER examples

    # --- ML Model Inference (Runs if no rules matched) ---
    try:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)

        # Optional: Move inputs to GPU if available (ensure model is also on GPU)
        # Example if using PyTorch:
        # device = 'cuda' if torch.cuda.is_available() else 'cpu'
        # model.to(device) # Move model if it wasn't already
        # inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)

        # Use Softmax to get probabilities for binary classification (sum to 1)
        probs = torch.softmax(outputs.logits, dim=1)[0] # dim=1 for batch dimension

        # --- Interpreting Model Output ---
        # Find the index for the target label name ('1')
        target_label_index = next((idx for idx, label in model_labels.items() if label == target_label_name), -1)

        score = 0 # Default score if target label not found (shouldn't happen if labels check passed)
        if target_label_index != -1 and target_label_index < len(probs):
             score = probs[target_label_index].item() # Get the probability for the target label ('1')
        else:
             # This case should ideally not happen if model_labels is {'0', '1'} and target_label_name is '1'
             # If it happens, it indicates an unexpected issue.
             print(f"Warning: Target label '{target_label_name}' not found in model labels during inference.")
             # Return an error state
             return {"text": text, "is_misogynistic": False, "score_misogyny": 0, "error": f"Internal: Target label '{target_label_name}' not found during inference."}


        # The text is considered misogynistic if the score for the 'misogyny' label ('1') is above the threshold.
        is_misogynistic = score > THRESHOLD

        # Return structure MUST match frontend interface (single score_misogyny)
        return {
            "text": text,
            "is_misogynistic": is_misogynistic,
            "score_misogyny": score, # Return the probability of the target label ('1')
            "rule_applied": None, # Indicate no rule was applied for this result
            "error": None
        }

    except Exception as e:
        print(f"Error during detection for text: '{text}' - {e}")
        # Return structure MUST match frontend interface (single score_misogyny)
        return {"text": text, "is_misogynistic": False, "score_misogyny": 0, "error": f"Detection failed: {e}"}


# --- Flask App Setup ---
app = Flask(__name__)
# Enable CORS so your Next.js frontend running on a different port can access this backend
# For a hackathon, allowing all origins (*) is usually fine, but be cautious in production.
CORS(app)

# --- API Endpoint: For direct text input ---
@app.route('/detect', methods=['POST'])
def detect():
    """
    API endpoint to receive text via POST request and return detection result.
    Expects JSON body like: {"text": "Your input text here"}
    Returns JSON body like: {"text": ..., "is_misogynistic": true/false, "score_misogyny": ..., "error": ...}
    """
    # Check if the request body is JSON and contains the 'text' key
    if not request.json or not 'text' in request.json:
        return jsonify({"error": "Invalid input. Provide 'text' in JSON body."}), 400 # Bad Request

    text_to_check = request.json['text']

    # Call the detection function
    result = detect_misogyny(text_to_check)

    # Return the result as JSON. Return 200 even on internal detection error
    # so frontend receives the error message in the JSON body.
    return jsonify(result), 200


# --- API Endpoint: For fetching statistics ---
@app.route('/statistics', methods=['GET'])
def get_statistics():
    """
    API endpoint to return the static misogyny statistics data.
    The data array `misogynisticStatistics_data` is defined at the top of this file.
    """
    # Check if the data is defined (it should be if included in this file)
    if 'misogynisticStatistics_data' in globals() and isinstance(misogynisticStatistics_data, list):
        return jsonify(misogynisticStatistics_data), 200
    else:
        print("Error: Statistics data not found in backend.")
        return jsonify({"error": "Statistics data not available"}), 500


# Optional: Root route for testing
@app.route('/')
def index():
    return "ShieldHER Misogyny Detection Backend is running! Endpoints: /detect (POST), /statistics (GET)"

# --- Running the App ---
if __name__ == '__main__':
    print("Starting Flask server...")
    # Ensure model is loaded before running the app's main loop if essential.
    # If model loading failed, the endpoints will return errors.
    model_check_ok = False
    if model is not None and tokenizer is not None and model_labels and set(model_labels.values()) == {'0', '1'}:
         model_check_ok = True

    if not model_check_ok:
        print("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("!! WARNING: MODEL LOADING FAILED OR LABELS ARE UNEXPECTED. !!")
        print("!! THE /detect ENDPOINT WILL RETURN ERRORS.                !!")
        print("!! Check error messages above and ensure model is accessible.!!")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n")
    else:
        print("Model loaded successfully and labels are as expected ('0', '1').")
        # Optional: Pre-run a small inference to warm up the model if needed
        # print("Warming up model...")
        # try:
        #     # Use a simple phrase that won't match rules
        #     detect_misogyny("warmup test")
        #     print("Model warm-up successful.")
        # except Exception as e:
        #     print(f"Model warm-up failed: {e}")


    # app.run starts the Flask development server
    # debug=True provides helpful error pages and auto-reloads on code changes
    # port=5000 sets the server to run on port 5000 (you can change this)
    # host='0.0.0.0' would make it accessible externally (don't need for localhost)
    app.run(debug=True, port=5000)