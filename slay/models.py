
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
        fields = ('id', 'board')


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


class PlayerModel(db.Model):
    __tablename__ = "players"
    id = db.Column(db.Integer, primary_key=True)
    color = db.Column(db.Integer)
    bank = db.Column(db.Integer)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    last_turn_time = db.Column(db.Integer)
    user = db.relationship("UserModel", backref="users")

    def __repr__(self):
        return f'player: {self.id}, color: {self.color}, bank: {self.bank}, game_id: {self.game_id}, ' + \
               f'user_id: {self.user_id}, last_turn_time: {self.last_turn_time}'


class PlayerSchema(ma.Schema):
    class Meta:
        fields = ('id', 'color', 'user_id', 'game_id', 'bank', 'last_turn_time')
    user = ma.Nested(UserSchema)


class GameModel(db.Model):
    __tablename__ = "games"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(16), unique=True)
    current_board_id = db.Column(db.Integer, db.ForeignKey('boards.id'))
    turn_colors = db.Column(db.String(24))
    current_turn = db.Column(db.Integer)
    board = db.relationship('BoardModel', backref='games')
    players = db.relationship('PlayerModel', backref='games')

    def __repr__(self):
        return f'game: {self.id}, name: {self.name}, current_turn: {self.current_turn}, ' + \
               f'current_board_id: {self.current_board_id}, turn_colors: {self.turn_colors}'


class GameSchema(ma.Schema):
    class Meta:
        fields = ('id', 'name', 'current_board_id', 'turn_colors', 'current_turn')
        board = ma.Nested(BoardSchema)
    players = ma.Nested(PlayerSchema, many=True)


class GameHistoryModel(db.Model):
    __tablename__ = "history"
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'))
    board_id = db.Column(db.Integer, db.ForeignKey('boards.id'))
    board = ma.Nested(BoardSchema)


class GameHistorySchema(ma.Schema):
    class Meta:
        fields = ('id', 'game_id', 'board_id')
