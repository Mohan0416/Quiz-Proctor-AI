from flask import Blueprint, request, session, jsonify
import requests
from datetime import datetime
from pymongo import MongoClient
import os

bp = Blueprint('form', __name__)

# Fix 1: MongoClient should receive the connection string, not pass it to os.getenv()
MONGO_URI = "mongodb+srv://manomohan714:12345@cluster0.jo91utj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["quiz_proctoring"]

@bp.route("/create-form", methods=["POST", "OPTIONS"])
def create_form():
    if request.method == "OPTIONS":
        return '', 200

    token = session.get("token")
    if not token:
        return jsonify({"error": "Not authenticated"}), 403

    data = request.json
    title = data.get("title", "Generated Quiz")
    questions = data.get("questions", [])

    headers = {
        "Authorization": f"Bearer {token['access_token']}",
        "Content-Type": "application/json"
    }
    form_res = requests.post(
        "https://forms.googleapis.com/v1/forms",
        headers=headers,
        json={"info": {"title": title}}
    )

    if form_res.status_code != 200:
        print("Form creation error:", form_res.json())
        return jsonify({"error": "Failed to create form", "details": form_res.json()}), 400

    form_data = form_res.json()
    form_id = form_data.get("formId")

    if not form_id:
        return jsonify({"error": "Form ID not returned"}), 400

    requests_payload = []
    index = 0

    for q in questions:
        item = {
            "createItem": {
                "item": {
                    "title": q["question"],
                    "questionItem": {
                        "question": {
                            "required": True,
                            "choiceQuestion": {
                                "type": "RADIO",
                                "options": [{"value": opt} for opt in q["options"]],
                                "shuffle": False
                            }
                        }
                    }
                },
                "location": {
                    "index": index
                }
            }
        }
        requests_payload.append(item)
        index += 1

    batch_res = requests.post(
        f"https://forms.googleapis.com/v1/forms/{form_id}:batchUpdate",
        headers=headers,
        json={"requests": requests_payload}
    )

    if batch_res.status_code != 200:
        return jsonify({"error": "Failed to add questions", "details": batch_res.json()}), 400

    return jsonify({"formId": form_id})

@bp.route('/submit-proctor-data', methods=['POST'])
def submit_proctor_data():
    try:
        data = request.json
        
        # Fix 2: Add better validation
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        email = data.get('email')
        name = data.get('name')
        student_class = data.get('class')
        year = data.get('year')
        tab_switches = data.get('tabSwitchCount', 0)  # Default to 0 if not provided
        quiz_id = data.get('quizId')

        # Fix 3: Validate all required fields
        if not email or not quiz_id or not name:
            return jsonify({"error": "Missing required fields (name, email, quizId)"}), 400

        # Fix 4: Add error handling for database insertion
        result = db.proctor_logs.insert_one({
            "quiz_id": quiz_id,
            "name": name,
            "email": email,
            "class": student_class,
            "year": year,
            "tab_switches": tab_switches,
            "timestamp": datetime.utcnow()
        })
        
        print(f"Proctor data saved with ID: {result.inserted_id}")
        return jsonify({"message": "Proctoring data saved successfully", "id": str(result.inserted_id)}), 200
        
    except Exception as e:
        print(f"Error saving proctor data: {e}")
        return jsonify({"error": "Failed to save proctoring data"}), 500