from flask import Blueprint, request, jsonify
from app.utils.extract_text import extract_text_from_pdf
from app.utils.prompt_builder import build_prompt
import os, requests

bp = Blueprint('generate', __name__) 

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
@bp.route("/generate", methods=["POST"])
def generate():
    try:
        print("[DEBUG] Received /generate request")
        print("[DEBUG] Files:", request.files)
        print("[DEBUG] Form:", request.form)

        file = request.files['file']
        num_qs = request.form['questions']
        diff = request.form['difficulty']
        topic = request.form.get('topic', None)

        text = extract_text_from_pdf(file)
        prompt = build_prompt(text, num_qs, diff, topic)

        print("[DEBUG] Prompt:", prompt)

        res = requests.post("https://api.groq.com/openai/v1/chat/completions", json={
            "model": "llama3-70b-8192",
            "messages": [
                {"role": "system", "content": "Generate MCQs."},
                {"role": "user", "content": prompt}
            ]
        }, headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        })

        json_data = res.json()
        print("[DEBUG] Groq API response:", json_data)

        if "choices" not in json_data:
            return jsonify({"error": "Invalid response from Groq API", "details": json_data}), 500

        content = json_data['choices'][0]['message']['content']
        return jsonify({"questions": content})

    except Exception as e:
        print("[ERROR]", str(e))
        return jsonify({"error": str(e)}), 500
