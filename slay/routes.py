
import json
import os

from flask import send_from_directory, request, render_template, abort, Markup
from flask import current_app as app

from .game import Game
from .board import Board

from firebase_admin import auth
from . import firebase_auth


def authenticate(req):
    try:
        return auth.verify_id_token(req.get('token'))
    except Exception:
        abort(401)


def ok(resp):
    return json.dumps(resp), 200, {'ContentType': 'application/json'}


_CONTENT_TYPE = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.html': 'text/html',
}


@app.route('/<path:path>')
def serve_files(path):
    mime_type = _CONTENT_TYPE.get(os.path.splitext(path)[1], 'text/plain')
    if mime_type == 'text/plain':
        abort(405)
    return send_from_directory('../www/', path, mimetype=mime_type)


@app.route('/')
def serve_index():
    return send_from_directory('../www/', 'home.html')


@app.route('/firebase')
def get_firebase():
    return firebase_auth


# unused
@app.route('/board/<board_id>', methods=['POST'])
def get_board(board_id):
    req = request.get_json()
    authenticate(req)
    board = Game.get_board_html(board_id)
    if not board:
        abort(404)
    board_html = Game.get_board_html(board)
    return render_template('game.html', title='Slay Game', tiles=Markup(board_html))


@app.route('/user/create', methods=['POST'])
def create_user():
    req = request.get_json()
    authenticate(req)
    email = req.get('email')
    username = req.get('username')
    computer = req.get('computer')
    # TODO: validate inputs
    ret = Game.create_user(email, username, computer)
    if not isinstance(ret, Exception):
        return ok(ret)
    else:
        return str(ret), 500


@app.route('/user/<username>', methods=['POST'])
def get_user(username):
    req = request.get_json()
    authenticate(req)
    user = Game.get_user(username)
    if user and not isinstance(user, Exception):
        return ok(user)
    else:
        abort(404)


@app.route('/user', methods=['POST'])
def get_all_users():
    req = request.get_json()
    authenticate(req)
    ret = Game.get_all_users()
    return ok(ret)


@app.route('/game/<game_id>')
def get_game_html(game_id):
    # TODO: do we need game_id ?
    return render_template('game.html', title='Slay Game')


@app.route('/game/<game_id>', methods=['POST'])
def get_game(game_id):
    req = request.get_json()
    authenticate(req)
    game = Game.get_game(game_id)
    if not game:
        abort(404)
    return ok(game)


@app.route('/game/create', methods=['POST'])
# @limiter.limit("1 per day")
def create_game():
    req = request.get_json()
    authenticate(req)
    game = Game.create_game(req['name'], req['users'])
    if not isinstance(game, Exception):
        return ok(game)
    else:
        abort(500)


@app.route('/regions', methods=['POST'])
def get_regions_stats():
    req = request.get_json()
    #authenticate(req)
    regions = Board(req['board']).get_regions_stats()
    return ok(regions)


@app.route('/game/<game_id>/savings', methods=['POST'])
def get_savings(game_id):
    req = request.get_json()
    #authenticate(req)
    game = Game.get_game(game_id)
    Game.get_savings(game.board)
    abort(500)  # TODO not implemented


@app.route('/game/<game_id>/validate', methods=['POST'])
def validate_move(game_id):
    req = request.get_json()
    #authenticate(req)
    game = Game.get_game(game_id)
    moves = req['moves']
    player_color_id = req['player_color_id']
    if not game or not player_color_id or not moves:
        abort(404)
    validate = Game.validate_move(game, moves, player_color_id)
    return ok(validate)
