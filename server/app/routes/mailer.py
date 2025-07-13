from flask import Blueprint, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

bp = Blueprint("mail", __name__)

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

@bp.route("/api/send-result", methods=["POST"])
def send_result():
    try:
        data = request.json
        to_email = data["email"]
        score = data["score"]
        name = data["name"]

        subject = f"Quiz Results for {name}"
        body = f"Hello {name},\n\nYour quiz has been submitted successfully.\nYour score: {score}\n\nThanks for participating!"

        msg = MIMEMultipart()
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        server.quit()

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
