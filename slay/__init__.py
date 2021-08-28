
import os
import json

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

import firebase_admin
from firebase_admin import credentials

from flask_marshmallow import Marshmallow

from .reminder import Reminder


template_dir = os.path.abspath(os.path.join(os.getcwd(), 'www'))
app = Flask(__name__, template_folder=template_dir)

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=[]  # "200 per day", "50 per hour"]
)

# TODO does stuff in this file need __file__ based path?
db_file = os.path.join(os.getcwd(), 'slay.db')
db_uri = os.environ.get('DATABASE_URI', f'sqlite:///{db_file}')
db_uri = db_uri.replace('postgres://', 'postgresql://')  # heroku doesn't append 'ql' suffix

app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)

firebase_auth = None
if os.environ.get('FIREBASE_AUTH'):
    firebase_auth = os.environ.get('FIREBASE_AUTH')
else:
    with open('firebase_auth.json', 'r') as auth_file:
        firebase_auth = auth_file.read()

firebase_creds = None
if os.environ.get('FIREBASE_ADMIN'):
    firebase_creds = json.loads(os.environ.get('FIREBASE_ADMIN'))
else:
    with open('firebase_admin.json', 'r') as auth_file:
        firebase_creds = json.loads(auth_file.read())

cred = credentials.Certificate(firebase_creds)
firebase_admin.initialize_app(cred)

Reminder.run()

with app.app_context():
    from . import routes
    db.create_all()
