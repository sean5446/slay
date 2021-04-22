
import json
import os

from flask import send_from_directory, request, render_template, abort, Markup
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
    board = Game.get_board_html(board_id)
    if not board:
        abort(404)
    board_html = Game.get_board_html(board)
    return render_template('game.html', title='Slay Game', tiles=Markup(board_html))


@app.route('/user/create', methods=['POST'])
def create_user():
    req = request.get_json()
    email = req.get('email')
    username = req.get('username')
    # TODO: validate inputs
    ret = Game.create_user(email, username)
    if not isinstance(ret, Exception):
        return json.dumps({'success': ret}), 200, {'ContentType': 'application/json'}
    else:
        return str(ret), 500


@app.route('/user/<username>')
def get_user(username):
    user = Game.get_user(username)
    if user and not isinstance(user, Exception):
        return json.dumps(user), 200, {'ContentType': 'application/json'}
    else:
        abort(404)


@app.route('/user')
def get_all_users():
    ret = Game.get_all_users()
    return json.dumps(ret), 200, {'ContentType': 'application/json'}


@app.route('/game/<game_id>')
def get_game(game_id):
    board_html, players_html = Game.get_game_board_html(game_id)
    if not board_html:
        abort(404)
    return render_template('game.html', title='Slay Game', tiles=Markup(board_html), players=Markup(players_html))


@app.route('/game/<game_id>/<username>')
def get_game_user(game_id, username):
    game, user = Game.get_game_user(game_id, username)
    ret = {
        'game': json.loads(game),
        'user': user,
    }
    return ret, 200, {'ContentType': 'application/json'}


@app.route('/game/create', methods=['POST'])
# @limiter.limit("1 per day")
def create_game():
    data = request.get_json()
    game = Game.create_game(data['name'], data['users'])
    if not isinstance(game, Exception):
        return json.dumps(game), 200, {'ContentType': 'application/json'}
    else:
        return 500
