# routes/form.py
from flask import Blueprint, request, session, jsonify
import requests

form_bp = Blueprint("form", __name__)

@form_bp.route("/api/create-form", methods=["POST"])
def create_form():
    token = session.get("token")
    if not token:
        return jsonify({"error": "Not authenticated"}), 403

    data = request.json
    title = data.get("title", "Generated Quiz")
    questions = data.get("questions", [])

    form_payload = {
        "info": {
            "title": title,
            "documentTitle": title
        },
        "items": []
    }

    for q in questions:
        form_payload["items"].append({
            "title": q["question"],
            "questionItem": {
                "question": {
                    "required": True,
                    "choiceQuestion": {
                        "type": "RADIO",
                        "options": [{"value": opt} for opt in q["options"]]
                    }
                }
            }
        })

    headers = {
        "Authorization": f"Bearer {token['access_token']}",
        "Content-Type": "application/json"
    }

    res = requests.post("https://forms.googleapis.com/v1/forms", headers=headers, json=form_payload)

    return jsonify(res.json())
