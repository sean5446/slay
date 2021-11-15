from random import shuffle
import json

from .board import Board
from .models import *
from .sendmail import SendMail

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
            return None
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
        if "Sean Magu" in users:  # TODO remove debug code
            users.remove("Sean Magu")
            users.insert(0, "Sean Magu")
        board_rand = Game.get_random_board(num_players=len(users))
        turn_colors = board_rand.get_player_turn_order()
        board_model = BoardModel(board=str(board_rand))
        db.session.add(board_model)
        db.session.commit()  # do I need to commit to get IDs?
        game_model = GameModel(name=name, current_board_id=board_model.id,
                               turn_colors=json.dumps(turn_colors), current_turn=turn_colors[0])
        history_model = GameHistoryModel(game_id=game_model.id, board_id=board_model.id)
        db.session.add(history_model)
        db.session.add(game_model)
        db.session.commit()
        i = 0
        emails = []
        for username in users:
            user = Game.get_user(username)
            emails.append(user['email'])
            color = turn_colors[i]
            i += 1
            regions = board_rand.get_regions(color)
            savings = {}
            for k, v in regions.items():
                savings[k] = board_rand.get_income_and_wages(v)[0] * 4
            savings = json.dumps(savings)
            player = PlayerModel(user_id=user['id'], color=color, savings=savings, game_id=game_model.id, last_turn_time=0)
            db.session.add(player)
        db.session.commit()
        for email in emails:
            SendMail.send_new_game(email, game_model.id)
        return game_schema.dump(game_model)

    @staticmethod
    def get_game(game_id):
        game_model = GameModel.query.filter(GameModel.id == game_id).first()
        if not game_model:
            return None
        return game_schema.dump(game_model)

    @staticmethod
    def unit_with_strength(strength):
        for k, v in Board.UNIT_VALUES.items():
            if v == strength:
                return k

    @staticmethod
    def validate_moves(game, moves, player_color_id):
        # is player turn?
        if game['current_turn'] is not player_color_id:
            return False

        board = Board(game['board']['board'])
        updates = []

        for move in moves:
            drag_row, drag_col = move[0]
            drop_row, drop_col = move[1]
            drop_unit = board.get_unit(drop_row, drop_col)
            drop_color = board.get_color(drop_row, drop_col)

            # new unit being placed
            if [drag_row, drag_col] == [-1, -1]:
                # TODO has enough money?
                drag_unit = 'MA'
            else:
                drag_unit = board.get_unit(drag_row, drag_col)

            # move within region or next to region
            regions = board.get_regions(player_color_id)

            # don't kill own huts

            # fortify or fight
            if drop_color == player_color_id:
                if Board.UNIT_VALUES[drop_unit] > 3:
                    total_strength = Board.UNIT_VALUES[drop_unit] + Board.UNIT_VALUES[drag_unit]
                    drag_unit = Game.unit_with_strength(total_strength)
            else:
                if Board.UNIT_VALUES[drag_unit] < Board.UNIT_VALUES[drop_unit]:
                    return False
            
            board.update_position(drop_row, drop_col, player_color_id, drag_unit)
            updates.append([drop_row, drop_col, player_color_id, drag_unit])
        
        regions = board.get_regions_stats()
        return { 'regions': regions, 'updates': updates }
