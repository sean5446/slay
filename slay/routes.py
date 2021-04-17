
import json
import os

from flask import send_from_directory, request, render_template, Markup
from flask import current_app as app

from .game import Game


firebase = None
if os.environ.get('FIREBASE'):
    firebase = os.environ.get('FIREBASE')
else:
    with open('firebase.json', 'r') as auth_file:
        firebase = auth_file.read()


@app.route('/firebase')
def get_firebase():
    return firebase


@app.route('/<path:path>')
def serve_files(path):
    return send_from_directory('../www/', path)


@app.route('/')
def serve_index():
    return send_from_directory('../www/', 'home.html')


@app.route('/board/<board_id>')
def get_board(board_id):
    return str(Game.get_board(board_id))


@app.route('/user/create', methods=['POST'])
def create_user():
    req = request.get_json()
    email = req.get('email')
    username = req.get('username')
    # TODO: validate inputs
    ret = Game.create_user(email, username)
    if not isinstance(ret, Exception):
        return json.dumps(ret), 200, {'ContentType': 'application/json'}
    else:
        return str(ret), 500


@app.route('/user/<username>', methods=['POST', 'GET'])
def get_user(username):
    user = Game.get_user(username)
    if not isinstance(user, Exception):
        return json.dumps(user), 200, {'ContentType': 'application/json'}
    else:
        return 404


@app.route('/user', methods=['POST', 'GET'])
def get_all_users():
    ret = Game.get_all_users()
    return json.dumps(ret), 200, {'ContentType': 'application/json'}


@app.route('/game/<game_id>')
def get_game(game_id):
    board_html = Game.get_game_board_html(game_id)
    return render_template('game.html', title='Slay Game', tiles=Markup(board_html))


@app.route('/game/create', methods=['POST'])
# @limiter.limit("1 per day")
def create_game():
    data = request.get_json()
    game = Game.create_game(data['name'], data['users'])
    if not isinstance(game, Exception):
        return json.dumps(game), 200, {'ContentType': 'application/json'}
    else:
        return 500
