from flask import Blueprint, request, session, jsonify
import requests
import json

bp = Blueprint("form", __name__)

@bp.route("/create-form", methods=["POST", "OPTIONS"])
def create_form():
    if request.method == "OPTIONS":
        return '', 200

    token = session.get("token")
    if not token:
        return jsonify({"error": "Not authenticated"}), 403

    access_token = token.get("access_token")
    if not access_token:
        return jsonify({"error": "Access token missing"}), 403

    data = request.json
    title = data.get("title", "Generated Quiz")
    questions = data.get("questions", [])

    # Step 1: Create Form with title
    form_payload = {
        "info": {
            "title": title,
            "documentTitle": title
        }
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    create_form_res = requests.post(
        "https://forms.googleapis.com/v1/forms", headers=headers, json=form_payload
    )

    if create_form_res.status_code != 200:
        print("[ERROR] Failed to create form:", create_form_res.text)
        return jsonify({"error": "Failed to create form", "details": create_form_res.json()}), 400

    form_id = create_form_res.json().get("formId")
    if not form_id:
        return jsonify({"error": "Form ID not returned"}), 400

    # Step 2: Add questions using batchUpdate
    update_payload = {
        "requests": []
    }

    for q in questions:
        question_text = q.get("question", "").strip()
        options = [str(opt).strip() for opt in q.get("options", []) if str(opt).strip()]

        if not question_text or len(options) < 2:
            print(f"[SKIPPED] Invalid question or options: {q}")
            continue

        update_payload["requests"].append({
            "createItem": {
                "item": {
                    "title": question_text,
                    "questionItem": {
                        "question": {
                            "required": True,
                            "choiceQuestion": {
                                "type": "RADIO",
                                "options": [{"value": opt} for opt in options],
                                "shuffle": False
                            }
                        }
                    }
                },
                "location": {"index": 0}
            }
        })

    if not update_payload["requests"]:
        return jsonify({"error": "No valid questions to add to the form"}), 400

    update_url = f"https://forms.googleapis.com/v1/forms/{form_id}:batchUpdate"
    print("[DEBUG] Sending batchUpdate payload:", json.dumps(update_payload, indent=2))

    update_res = requests.post(update_url, headers=headers, json=update_payload)

    if update_res.status_code != 200:
        print("[ERROR] Failed to add questions:", update_res.text)
        return jsonify({"error": "Failed to add questions", "details": update_res.json()}), 400

    form_link = f"https://docs.google.com/forms/d/{form_id}/viewform"
    return jsonify({"formLink": form_link}), 200
