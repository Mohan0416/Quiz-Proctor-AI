def build_prompt(pdf_text, num_questions, difficulty, topic=None):
    return f"""
You are a helpful teaching assistant. Based ONLY on the text below, generate {num_questions} {difficulty.lower()} MCQs.

{f"Topic: {topic}" if topic else "Use any topic from text."}

Only use this content below:

{text}
"""
