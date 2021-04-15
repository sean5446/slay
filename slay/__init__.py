
import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
# cd www && python3 -m http.server

from flask_marshmallow import Marshmallow

from .reminder import Reminder

db_file = os.path.join(os.getcwd(), 'slay.db')
template_dir = os.path.abspath(os.path.join(os.getcwd(), 'www'))
app = Flask(__name__, template_folder=template_dir)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_file}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)
Reminder.run()

with app.app_context():
    from . import routes
    db.create_all()





