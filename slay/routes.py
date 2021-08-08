
import json

from flask import send_from_directory, request, render_template, abort, Markup
from flask import current_app as app

from .game import Game

from firebase_admin import auth
from . import firebase_auth


def authenticate(req):
    try:
        return auth.verify_id_token(req.get('token'))
    except Exception:
        abort(401)


def ok(resp):
    return json.dumps(resp), 200, {'ContentType': 'application/json'}


@app.route('/firebase')
def get_firebase():
    return firebase_auth


@app.route('/<path:path>')
def serve_files(path):
    return send_from_directory('../www/', path)


@app.route('/')
def serve_index():
    return send_from_directory('../www/', 'home.html')


# unused?
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
        return ok({'success': ret})
    else:
        return str(ret), 500


@app.route('/user/<username>')
def get_user(username):
    user = Game.get_user(username)  # TODO does this work with spaces?
    if user and not isinstance(user, Exception):
        return ok(user)
    else:
        abort(404)


@app.route('/user')
def get_all_users():
    ret = Game.get_all_users()
    return ok(ret)


@app.route('/game/<game_id>')
def get_game_html(game_id):
    return render_template('game.html', title='Slay Game')


@app.route('/game/<game_id>', methods=['POST'])
def get_game(game_id):
    game = Game.get_game(game_id)
    if not game:
        abort(404)
    return ok(game)


@app.route('/game/create', methods=['POST'])
# @limiter.limit("1 per day")
def create_game():
    data = request.get_json()
    game = Game.create_game(data['name'], data['users'])
    if not isinstance(game, Exception):
        return ok(game)
    else:
        return 500


@app.route('/game/<game_id>/validate', methods=['POST'])
def validate_moves(game_id):
    req = request.get_json()
    username = req.username
    moves = req.moves
    game = Game.get_game(game_id)
    user = Game.get_user(username)
    if not game or not user:
        abort(404)
    Game.validate_moves(moves, user, game.board)
    resp = {'request': req, 'game': game}
    return ok(resp)
