from flask import Blueprint, redirect, request, session
from requests_oauthlib import OAuth2Session
import os

auth_bp = Blueprint("auth", __name__)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

SCOPES = [
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid"
]

@auth_bp.route("/api/auth/login")
def login():
    google = OAuth2Session(GOOGLE_CLIENT_ID, scope=SCOPES, redirect_uri=REDIRECT_URI)
    auth_url, state = google.authorization_url(
        "https://accounts.google.com/o/oauth2/auth",
        access_type="offline", prompt="consent"
    )
    session["oauth_state"] = state
    return redirect(auth_url)


@auth_bp.route("/api/auth/callback")
def callback():
    google = OAuth2Session(GOOGLE_CLIENT_ID, state=session["oauth_state"], redirect_uri=REDIRECT_URI)
    token = google.fetch_token(
        "https://oauth2.googleapis.com/token",
        client_secret=GOOGLE_CLIENT_SECRET,
        authorization_response=request.url,
    )
    session["token"] = token
    return redirect("http://localhost:5173/dashboard")
