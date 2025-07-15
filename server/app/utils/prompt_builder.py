def build_prompt(text, num_qs, difficulty, topic=None):
    prompt = f"""
You are a helpful teaching assistant. Based ONLY on the text below, generate {num_qs} {difficulty} level multiple-choice questions in JSON format.

Instructions:
- Each question must have exactly 4 options.
- Only one correct answer.
- Output only a JSON array.
- Each object in the array must be in this format:

{{
  "question": "What is ...?",
  "options": ["a", "b", "c", "d"],
  "answer": "b"
}}

Topic: {topic or "General"}

Content:
{text}
    """.strip()
    return prompt
