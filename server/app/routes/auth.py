from flask import Blueprint, redirect, session, request, jsonify
from google_auth_oauthlib.flow import Flow
import os, pathlib

bp = Blueprint("auth", __name__)

# Enable insecure transport for localhost
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
        prompt='consent',
        access_type='offline',
        include_granted_scopes='true'
    )
    return redirect(auth_url)  # 🔁 redirect directly to Google login

@bp.route("/callback")
def callback():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI
    )
    flow.fetch_token(authorization_response=request.url)

    credentials = flow.credentials
    session["token"] = {
        "access_token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes
    }

    # ✅ redirect to frontend dashboard
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
    return jsonify({"user": {"email": "authenticated_user"}}), 200
