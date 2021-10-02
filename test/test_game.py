import unittest

from slay.game import Game
from slay.models import *


class TestGame(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Game.create_user(email='bot@bot.com', username='bot', computer=1)

    @classmethod
    def tearDownClass(cls):
        user = db.session.query(UserModel).filter(UserModel.username == 'bot')
        user.delete()
        game = db.session.query(GameModel).filter(GameModel.name == 'BotGame')
        game.delete()
        db.session.commit()

    def test_get_user(self):
        user = Game.get_user('bot')
        assert user is not None

    def test_create_game(self):
        game = Game.create_game('BotGame', ['bot'])
        assert game is not None

    def validate_move(self):
        pass


if __name__ == '__main__':
    unittest.main()
