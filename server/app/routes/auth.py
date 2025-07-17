from flask import Blueprint, redirect, session, request, jsonify
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os
import pathlib
import requests

bp = Blueprint("auth", __name__)

# Allow HTTP for local testing
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:5000/api/callback"

SCOPES = [
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid"
]

CLIENT_SECRETS_FILE = str(pathlib.Path(__file__).parent.parent / "client_secret.json")

@bp.route("/login")
def login():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    auth_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'  # 🟢 Important to always get refresh_token
    )
    return redirect(auth_url)

@bp.route("/callback")
def callback():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials

    # Save token in session
    session["token"] = {
        "access_token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes
    }

    return redirect("http://localhost:5173")

@bp.route("/logout")
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200

@bp.route("/user")
def get_user():
    token = session.get("token")
    if not token:
        return jsonify({"user": None}), 200

    headers = {
        "Authorization": f"Bearer {token['access_token']}"
    }
    response = requests.get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", headers=headers)
    
    if response.status_code == 200:
        return jsonify({"user": response.json()}), 200
    else:
        return jsonify({"user": None}), 200

# ✅ Utility function: refresh token (use this in any route like /create-form)
def refresh_access_token(refresh_token):
    data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    res = requests.post("https://oauth2.googleapis.com/token", data=data)
    if res.status_code == 200:
        return res.json()["access_token"]
    return None
