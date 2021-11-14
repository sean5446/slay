
from . import db
from . import ma


class BoardModel(db.Model):
    __tablename__ = 'boards'
    id = db.Column(db.Integer, primary_key=True)
    board = db.Column(db.String(1024))

    def __repr__(self):
        return f'board={self.id}, board_size={len(self.board)}'


class BoardSchema(ma.Schema):
    class Meta:
        fields = ('id', 'board')


class UserModel(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(96), unique=True)
    email = db.Column(db.String(96), unique=True)
    computer = db.Column(db.Integer)
    score = db.Column(db.Integer)

    def __repr__(self):
        return f'user={self.id}, {self.username=}, {self.computer=}, {self.score=}'


class UserSchema(ma.Schema):
    class Meta:
        fields = ('id', 'username', 'email', 'score')


class PlayerModel(db.Model):
    __tablename__ = 'players'
    id = db.Column(db.Integer, primary_key=True)
    color = db.Column(db.String(1))
    savings = db.Column(db.String(256))
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    last_turn_time = db.Column(db.Integer)
    user = db.relationship('UserModel', backref='users')

    def __repr__(self):
        return f'player={self.id}, {self.color=}, {self.savings=} {self.game_id=}, ' + \
               f'{self.user_id=}, {self.last_turn_time=}'


class PlayerSchema(ma.Schema):
    class Meta:
        fields = ('id', 'color', 'savings', 'user_id', 'game_id', 'last_turn_time', 'user')
    user = ma.Nested(UserSchema)


class GameModel(db.Model):
    __tablename__ = 'games'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    current_board_id = db.Column(db.Integer, db.ForeignKey('boards.id'))
    turn_colors = db.Column(db.String(256))
    current_turn = db.Column(db.String(1))
    board = db.relationship('BoardModel', backref='games')
    players = db.relationship('PlayerModel', backref='games')

    def __repr__(self):
        return f'game={self.id}, {self.name=}, {self.current_turn=}, ' + \
               f'{self.current_board_id=}, {self.turn_colors=}'


class GameSchema(ma.Schema):
    class Meta:
        fields = ('id', 'name', 'current_board_id', 'turn_colors', 'current_turn', 'players', 'board')
    players = ma.Nested(PlayerSchema, many=True)
    board = ma.Nested(BoardSchema)


class GameHistoryModel(db.Model):
    __tablename__ = 'history'
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'))
    board_id = db.Column(db.Integer, db.ForeignKey('boards.id'))
    board = ma.Nested(BoardSchema)

    def __repr__(self):
        return f'history={self.id}, {self.game_id=}, {self.board_id=}' 


class GameHistorySchema(ma.Schema):
    class Meta:
        fields = ('id', 'game_id', 'board_id')
