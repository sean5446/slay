
from . import db
from . import ma


class BoardModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    board = db.Column(db.String(999))

    def __repr__(self):
        return f'board: {self.id}'


class BoardSchema(ma.Schema):
    class Meta:
        fields = ('id', 'board', 'game_id')


class GameModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    players = db.Column(db.String(999))
    current_board_id = db.Column(db.Integer)
    turn_player_id = db.Column(db.Integer)
    history = db.Column(db.String(999))

    def __repr__(self):
        return f'game: {self.id}'


class GameSchema(ma.Schema):
    class Meta:
        fields = ('id', 'players', 'current_board_id', 'player_turn_id', 'history')


class PlayerModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bank = db.Column(db.Integer)
    user_id = db.Column(db.Integer)
    last_turn_time = db.Column(db.Integer)

    def __repr__(self):
        return f'player: {self.id}'


class PlayerSchema(ma.Schema):
    class Meta:
        fields = ('id', 'user_id', 'bank', 'last_turn_time')


class UserModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(99), unique=True)
    email = db.Column(db.String(99), unique=True)
    password = db.Column(db.String(128))
    score = db.Column(db.Integer)

    def __repr__(self):
        return f'id: {self.id}, name: {self.username}, score: {self.score}'


class UserSchema(ma.Schema):
    class Meta:
        fields = ('id', 'username', 'email', 'password', 'score')
