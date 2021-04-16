
from . import db
from . import ma


class BoardModel(db.Model):
    __tablename__ = "boards"
    id = db.Column(db.Integer, primary_key=True)
    board = db.Column(db.String(999))

    def __repr__(self):
        return f'board: {self.id}'


class BoardSchema(ma.Schema):
    class Meta:
        fields = ('id', 'board', 'game_id')


class GameModel(db.Model):
    __tablename__ = "games"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(16), unique=True)
    current_board_id = db.Column(db.Integer, db.ForeignKey('boards.id'))
    turn_player_id = db.Column(db.Integer)

    def __repr__(self):
        return f'game: {self.id}, name: {self.name}, ' + \
               f'current_board_id: {self.current_board_id}, turn_player_id: {self.turn_player_id}'


class GameSchema(ma.Schema):
    class Meta:
        fields = ('id', 'name', 'players', 'current_board_id', 'turn_player_id')


class GameHistoryModel(db.Model):
    __tablename__ = "history"
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'))
    board_id = db.Column(db.Integer, db.ForeignKey('boards.id'))


class GameHistorySchema(ma.Schema):
    class Meta:
        fields = ('id', 'game_id', 'board_id')


class PlayerModel(db.Model):
    __tablename__ = "players"
    id = db.Column(db.Integer, primary_key=True)
    bank = db.Column(db.Integer)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    last_turn_time = db.Column(db.Integer)

    def __repr__(self):
        return f'player: {self.id}, bank: {self.bank}, ' + \
               f'user_id: {self.user_id}, last_turn_time: {self.last_turn_time}'


class PlayerSchema(ma.Schema):
    class Meta:
        fields = ('id', 'user_id', 'bank', 'last_turn_time')


class UserModel(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(99), unique=True)
    email = db.Column(db.String(99), unique=True)
    score = db.Column(db.Integer)

    def __repr__(self):
        return f'id: {self.id}, name: {self.username}, score: {self.score}'


class UserSchema(ma.Schema):
    class Meta:
        fields = ('id', 'username', 'email', 'score')
