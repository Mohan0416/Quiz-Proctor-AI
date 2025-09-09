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

        # Extract file and form fields
        file = request.files['file']
        num_qs = request.form['questions']
        diff = request.form['difficulty']
        topic = request.form.get('topic', None)

        # Extract text from PDF
        text = extract_text_from_pdf(file)
        print("[DEBUG] Extracted text length:", len(text))

        # Build prompt for the LLM
        prompt = build_prompt(text, num_qs, diff, topic)
        print("[DEBUG] Prompt:\n", prompt)

        # Send request to Groq's LLM
        res = requests.post("https://api.groq.com/openai/v1/chat/completions", json={
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "Generate MCQs."},
                {"role": "user", "content": prompt}
            ]
        }, headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        })

        # Handle Groq response
        json_data = res.json()
        print("[DEBUG] Groq API response:", json_data)

        if "choices" not in json_data:
            print("[ERROR] Invalid response structure from Groq API")
            return jsonify({"error": "Invalid response from Groq API", "details": json_data}), 500

        content = json_data['choices'][0]['message']['content']
        print("[DEBUG] Generated MCQs:\n", content)

        return jsonify({"questions": content})

    except Exception as e:
        print("[ERROR]", str(e))
        return jsonify({"error": str(e)}), 500
