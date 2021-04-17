
import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
# cd www && python3 -m http.server

from flask_marshmallow import Marshmallow

from .reminder import Reminder


template_dir = os.path.abspath(os.path.join(os.getcwd(), 'www'))
app = Flask(__name__, template_folder=template_dir)

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=[]  # "200 per day", "50 per hour"]
)

db_file = os.path.join(os.getcwd(), 'slay.db')
db_uri = os.environ.get('DATABASE_URL', f'sqlite:///{db_file}')
db_uri = db_uri.replace('postgres://', 'postgresql://')

app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)
Reminder.run()

with app.app_context():
    from . import routes
    db.create_all()
