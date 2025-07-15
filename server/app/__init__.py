from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_session import Session
import os

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config["SESSION_TYPE"] = "filesystem"
    Session(app)
   
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
    app.secret_key = os.getenv("FLASK_SECRET_KEY")

    from app.routes.auth import bp as auth_bp
    from app.routes.form import bp as form_bp
    from app.routes.generate import bp as generate_bp
    from app.routes.link import bp as link_bp
    from app.routes.mailer import bp as mail_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(form_bp, url_prefix="/api")
    app.register_blueprint(generate_bp, url_prefix="/api")
    app.register_blueprint(link_bp, url_prefix="/api")
    app.register_blueprint(mail_bp, url_prefix="/api")

    return app
