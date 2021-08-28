import unittest

from slay.game import Game
from slay.models import *


class TestGame(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Game.create_user(email='sean@sean.com', username='Sean')

    @classmethod
    def tearDownClass(cls):
        user = db.session.query(UserModel).filter(UserModel.username == 'Sean')
        user.delete()
        game = db.session.query(GameModel).filter(GameModel.name == 'SeanGame')
        game.delete()
        db.session.commit()

    def test_get_user(self):
        user = Game.get_user('Sean')
        assert user is not None

    def test_create_game(self):
        game, board = Game.create_game('SeanGame', ['Sean'])
        assert game is not None
        assert board is not None

    def validate_move(self):
        pass


if __name__ == '__main__':
    unittest.main()
