import hashlib

from .board import Board
from .models import *

salt = 'salty-brine'
user_schema = UserSchema(only=['id', 'username', 'score'])
users_schema = UserSchema(only=['id', 'username', 'score'], many=True)
game_schema = GameSchema()
board_schema = BoardSchema()


class Game:
    @staticmethod
    def get_random_board(num_rows=13, num_cols=8, num_players=5, std_dev=1.2):
        return Board(num_rows, num_cols, num_players, std_dev)

    @staticmethod
    def create_board(board):
        new_board = BoardModel(board=board)
        db.session.add(new_board)
        db.session.commit()
        return new_board

    @staticmethod
    def get_board(board_id):
        return BoardModel.query.filter(BoardModel.id == board_id)

    @staticmethod
    def create_user(email, username, password):
        try:
            password_hash = hashlib.sha3_512((salt + password).encode()).hexdigest()
            db.session.add(UserModel(email=email, username=username, password=password_hash, score=0))
            db.session.commit()
            return {'success': True}
        except Exception as ex:
            return ex

    @staticmethod
    def get_all_users():
        all_users = UserModel.query.all()
        return users_schema.dump(all_users)

    @staticmethod
    def get_user(username, external=True):
        if external:
            return user_schema.dump(UserModel.query.filter(UserModel.username == username).first())
        else:
            return UserModel.query.filter(UserModel.username == username).first()

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
        players = []
        for username in users:
            user_id = Game.get_user(username, False).id
            player = Game.create_player(user_id)
            players.append(player.id)
        board_rand = Game.get_random_board(num_players=len(players))
        current_player_turn = list(board_rand.get_player_turn_order().keys())[0]
        board_model = Game.create_board(str(board_rand))
        game_model = GameModel(players=str(players), name=name, current_board_id=board_model.id,
                               turn_player_id=int(current_player_turn), history='')
        db.session.add(board_model)
        db.session.add(game_model)
        db.session.commit()
        return {
            "game": game_schema.dump(game_model),
            "board": board_schema.dump(board_rand),
            "turn": current_player_turn
        }

    @staticmethod
    def get_game_board(game_id):
        game = GameModel.query.filter(GameModel.id == game_id).first()
        board_id = game.current_board_id()
        board = Game.get_board(board_id)
        pass

    @staticmethod
    def update_game():
        pass

    @staticmethod
    def create_player(user_id):
        player = PlayerModel(user_id=user_id, bank=0, last_turn_time=0)
        db.session.add(player)
        db.session.commit()
        return player

    @staticmethod
    def get_player(user_id):
        pass

    @staticmethod
    def update_player(bank, last_turn_time):
        pass
