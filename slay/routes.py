
import json

from flask import send_from_directory, request, render_template
from flask import current_app as app

from .game import Game


@app.route('/<path:path>')
def serve_files(path):
    return send_from_directory('../www/', path)


@app.route('/')
def serve_index():
    return send_from_directory('../www/', 'home.html')


@app.route('/board/<board_id>')
def get_board(board_id):
    return str(Game.get_board(board_id))


@app.route('/board/random')
def get_random_board():
    return str(Game.get_random_board(num_players=5).render_to_html())


@app.route('/user/create', methods=['POST'])
def create_user():
    req = request.get_json()
    email = req.get('email')
    username = req.get('username')
    password = req.get('password')
    # TODO: validate inputs
    ret = Game.create_user(email, username, password)
    if not isinstance(ret, Exception):
        return json.dumps(ret), 200, {'ContentType': 'application/json'}
    else:
        return str(ret), 500


@app.route('/user/update', methods=['POST'])
def update_user():
    req = request.get_json()
    username = req.get('username', None)
    score = req.get('score', None)
    ret = Game.update_user(username, score)
    if not isinstance(ret, Exception):
        return json.dumps(ret), 200, {'ContentType': 'application/json'}
    else:
        return str(ret), 500


@app.route('/user/<username>', methods=['POST', 'GET'])
def get_user(username):
    ret = Game.get_user(username)
    if ret:
        return json.dumps(ret), 200, {'ContentType': 'application/json'}
    else:
        return ret, 404, {'ContentType': 'application/json'}


@app.route('/user', methods=['POST', 'GET'])
def get_all_users():
    ret = Game.get_all_users()
    return json.dumps(ret), 200, {'ContentType': 'application/json'}


@app.route('/game/<game_id>', methods=['GET', 'POST'])
def get_game(game_id):
    Game.get_game(game_id)
    return render_template('game.html', title='Testing123', tiles="TILES!!!")


@app.route('/game/create', methods=['POST'])
def create_game():
    data = request.get_json()
    game = Game.create_game(data['name'], data['users'])
    if game:
        return json.dumps(game), 200, {'ContentType': 'application/json'}
    else:
        return 500
