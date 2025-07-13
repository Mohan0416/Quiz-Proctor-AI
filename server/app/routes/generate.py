from flask import Blueprint, request, jsonify
from utils.extract_text import extract_text_from_pdf
from utils.prompt_builder import build_prompt
import os, requests

generate_bp = Blueprint('generate', __name__)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

@generate_bp.route("/api/generate", methods=["POST"])
def generate():
    try:
        file = request.files['file']
        num_qs = request.form['questions']
        diff = request.form['difficulty']
        topic = request.form.get('topic', None)

        text = extract_text_from_pdf(file)
        prompt = build_prompt(text, num_qs, diff, topic)

        res = requests.post("https://api.groq.com/openai/v1/chat/completions", json={
            "model": "mixtral-8x7b-32768",
            "messages": [
                {"role": "system", "content": "Generate MCQs."},
                {"role": "user", "content": prompt}
            ]
        }, headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        })

        content = res.json()['choices'][0]['message']['content']
        return jsonify({"questions": content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
