from flask import Blueprint, request, jsonify
import uuid
import os

link_bp = Blueprint("link", __name__)
FRONTEND_URL = os.getenv("FRONTEND_BASE_URL")

@link_bp.route("/api/get-proctor-link", methods=["POST"])
def get_link():
    form_url = request.json.get("form_url")
    token = str(uuid.uuid4())
    proctor_url = f"{FRONTEND_URL}?token={token}&form={form_url}"
    return jsonify({"proctor_link": proctor_url})
