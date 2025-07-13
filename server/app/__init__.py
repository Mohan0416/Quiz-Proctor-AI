from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.secret_key = os.getenv("FLASK_SECRET_KEY")
    CORS(app, supports_credentials=True)
    from app.routes.auth import auth_bp
    from app.routes.form import form_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(form_bp)

    return app
