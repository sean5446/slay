
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
    ok = request.get_json()
    email = request.form.get('email', None)
    username = request.form.get('username', None)
    password = request.form.get('password', None)
    # TODO: validate inputs
    ret = Game.create_user(email, username, password)
    if type(ret) is not Exception:
        return json.dumps(ret), 200, {'ContentType': 'application/json'}
    else:
        return str(ret), 500


@app.route('/user/update', methods=['POST'])
def update_user():
    username = request.form.get('username', None)
    score = request.form.get('score', None)
    ret = Game.update_user(username, score)
    if type(ret) is not Exception:
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
    users = unpack_flask(request)
    game = Game.create_game(users)
    if game:
        return json.dumps(game), 200, {'ContentType': 'application/json'}
    else:
        return 500


# this is a disgusting hack?
def unpack_flask(req):
    return json.loads(list(req.form.keys())[0])['data']
