import unittest

from slay.game import Game
from slay.models import *


class TestGame(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Game.create_user(email='sean@sean.com', username='Sean', password='123')

    def test_get_user(self):
        assert Game.get_user('Sean') is not None

    def test_create_game(self):
        assert Game.create_game(['Sean']) is not None

    @classmethod
    def tearDownClass(cls):
        db.session.query(UserModel).filter(UserModel.username == 'Sean').delete()
        db.session.commit()


if __name__ == '__main__':
    unittest.main()
