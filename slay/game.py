from random import shuffle

from .board import Board
from .models import *

user_schema = UserSchema()
users_schema = UserSchema(many=True)
game_schema = GameSchema()
board_schema = BoardSchema()
player_schema = PlayerSchema()


class Game:
    @staticmethod
    def get_random_board(num_rows=13, num_cols=8, num_players=5, std_dev=1.2):
        return Board(std_dev, num_rows, num_cols, num_players)

    @staticmethod
    def create_board(board):
        new_board = BoardModel(board=board)
        db.session.add(new_board)
        db.session.commit()
        return new_board

    @staticmethod
    def create_user(email, username):
        try:
            db.session.add(UserModel(email=email, username=username, score=0))
            db.session.commit()
            return {'success': True}
        except Exception as ex:
            return ex

    @staticmethod
    def get_all_users():
        all_users = UserModel.query.all()
        return users_schema.dump(all_users)

    @staticmethod
    def get_user(username):
        user = UserModel.query.filter(UserModel.username == username).first()
        if not user:
            return user
        players = PlayerModel.query.filter(PlayerModel.user_id == user.id)
        user_with_games = user_schema.dump(user)
        games = {}
        for player in players:
            game = GameModel.query.filter(GameModel.id == player.game_id).first()
            games[player.game_id] = game.name
        user_with_games['games'] = games
        return user_with_games

    @staticmethod
    def update_user(username, score):
        try:
            user = UserModel.query.filter_by(username=username).first()
            user.score = score
            db.session.commit()
            return {'success': True}
        except Exception as ex:
            return ex

    @staticmethod
    def create_game(name, users):
        shuffle(users)
        board_rand = Game.get_random_board(num_players=len(users))
        turn_colors = board_rand.get_player_turn_order()
        board_model = Game.create_board(str(board_rand))  # adds and commits
        game_model = GameModel(name=name, current_board_id=board_model.id,
                               turn_colors=turn_colors, current_turn=turn_colors[0])
        history_model = GameHistoryModel(game_id=game_model.id, board_id=board_model.id)
        db.session.add(history_model)
        db.session.add(game_model)
        db.session.commit()
        i = 0
        for username in users:
            user_id = Game.get_user(username)['id']
            player = PlayerModel(user_id=user_id, game_id=game_model.id, color=turn_colors.split(',')[i],
                                 bank=0, last_turn_time=0)
            db.session.add(player)
            i += 1
        db.session.commit()
        return game_schema.dump(game_model)

    @staticmethod
    def get_game_board(game_id):
        game = GameModel.query.filter(GameModel.id == game_id).first()
        board_id = game.current_board_id()
        board = Game.get_board(board_id)
        return board

    @staticmethod
    def get_game_user(game_id, username):
        user = Game.get_user(username)
        user_id = int(user['id'])
        player = PlayerModel.query.filter(PlayerModel.user_id == user_id).filter(PlayerModel.game_id == game_id).first()
        user['player'] = player_schema.dump(player)
        return user

    @staticmethod
    def get_games(user_id):
        players = PlayerModel.query.filter(PlayerModel.user_id == user_id)
        return players

    @staticmethod
    def get_game_board_html(game_id):
        game = GameModel.query.filter(GameModel.id == game_id).first()
        if not game:
            return None, None
        board_html = Board(game.board.board).render_to_html()
        players_html = Game.game_to_html(game)
        return board_html, players_html

    @staticmethod
    def get_board_html(board_id):
        board = BoardModel.query.filter(BoardModel.id == board_id).first()
        if not board:
            return None
        return Board(board.board).render_to_html()

    @staticmethod
    def game_to_html(game):
        players_html = ''
        board = Board(game.board.board)
        counts = board.get_player_tile_count()
        for player in game.players:
            user = player.user
            players_html += f'<div style="color: {Board.PLAYER_COLORS[str(player.color)]};">' + \
                            f'{user.username}: {counts[str(player.color)]}</div>\n'
        return players_html
