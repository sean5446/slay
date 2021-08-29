from random import shuffle
import json

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
    def create_user(email, username, computer):
        try:
            if not computer:
                computer = 0
            db.session.add(UserModel(email=email, username=username, score=0, computer=computer))
            db.session.commit()
            return True
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
            return True
        except Exception as ex:
            return ex

    @staticmethod
    def create_game(name, users):
        shuffle(users)
        users.remove("Sean Magu")  # TODO remove debug code
        users.insert(0, "Sean Magu")  # TODO remove debug code
        board_rand = Game.get_random_board(num_players=len(users))
        turn_colors = board_rand.get_player_turn_order()
        board_model = Game.create_board(str(board_rand))  # creates and commits to db
        game_model = GameModel(name=name, current_board_id=board_model.id,
                               turn_colors=turn_colors, current_turn_color=turn_colors[0])
        history_model = GameHistoryModel(game_id=game_model.id, board_id=board_model.id)
        db.session.add(history_model)
        db.session.add(game_model)
        i = 0
        for username in users:
            user_id = Game.get_user(username)['id']
            color = turn_colors.split(',')[i]; i += 1
            player = PlayerModel(user_id=user_id, game_id=game_model.id, color=color, last_turn_time=0)
            db.session.add(player)
        db.session.commit()
        return game_schema.dump(game_model)

    @staticmethod
    def get_game(game_id):
        game_model = GameModel.query.filter(GameModel.id == game_id).first()
        if not game_model:
            return None
        regions = {}
        board = Board(game_model.board.board)
        for color in game_model.turn_colors.split(','):
            player_regions = board.get_regions(color)
            regions[color] = {}
            for k, v in player_regions.items():
                regions[color][k] = {}
                regions[color][k]['tiles'] = v
                regions[color][k]['savings'] = len(v) * 4  # TODO subtract trees :'(
                regions[color][k]['wages'] = 0  # TODO calc wages
        game = game_schema.dump(game_model)
        game['regions'] = regions
        return game

    @staticmethod
    def validate_move(board, moves, user):
        # is player turn?

        # move is not upgrading baron

        # had enough money to place unit

        # move within region or next to region

        # unit is strong enough to move to location
        
        pass
