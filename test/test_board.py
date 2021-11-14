
import unittest

from slay.board import Board


class TestBoard(unittest.TestCase):

    def test_get_neighbors(self):
        board = Board(board_type=5.0, num_rows=4, num_cols=4, num_players=1)
        assert board.num_cols == 4
        assert board.num_rows == 4
        assert board.num_players == 1
        assert len(board.get_player_turn_order()) == 1
        assert board.get_neighbors(0, 0) == [(0, 1), (1, 0)]
        assert board.get_neighbors(1, 0) == [(0, 0), (0, 1), (1, 1), (2, 0), (2, 1)]
        assert board.get_neighbors(3, 0) == [(2, 0), (2, 1), (3, 1)]
        assert board.get_neighbors(3, 3) == [(2, 3), (3, 2)]
        assert board.get_neighbors(0, 2) == [(0, 1), (0, 3), (1, 1), (1, 2)]
        assert board.get_neighbors(0, 3) == [(0, 2), (1, 2), (1, 3)]
        assert board.get_neighbors(2, 2) == [(1, 1), (1, 2), (2, 1), (2, 3), (3, 1), (3, 2)]
        assert board.get_neighbors(1, 1) == [(0, 1), (0, 2), (1, 0), (1, 2), (2, 1), (2, 2)]
        print('test_get_neighbors passed!')

    def test_fair_random_board(self):
        board = Board(board_type=1.2, num_rows=5, num_cols=9, num_players=5)
        print(board)
        assert board.std_dev_player_tiles() <= 1.2
        assert len(board.get_player_turn_order()) == 5
        assert board.num_cols == 9
        assert board.num_rows == 5
        assert board.num_players == 5

    def test_get_player_turn_order(self):
        board = Board(board_type=1.2, num_cols=5, num_rows=5, num_players=5)
        assert len(board.get_player_turn_order()) == 5

    def test_from_arrays(self):
        board = Board([ ["TMT", "RMT"], ["TMT", "RMT"] ])
        assert board.num_cols == 2
        assert board.num_rows == 2
        assert board.num_players == 1

    def test_get_regions(self):
        board_str = """
            TMT TMT TMT RMT TMT RMT TMT TMT TMT 
            TMT TMT TMT RMT RMT TMT TMT TMT TMT 
            TMT TMT TMT RMT TMT RMT TMT TMT TMT 
            TMT TMT RMT TMT TMT RMT RMT TMT TMT 
            TMT RMT RMT TMT TMT RMT TMT TMT TMT 
        """
        board = Board(board_str)
        assert len(board.get_player_turn_order()) == 1
        assert board.num_cols == 9
        assert board.num_rows == 5
        assert board.num_players == 1

        tiles = board.get_regions('R')
        assert tiles == {'(0, 5)': [(0, 5), (1, 4), (0, 3), (1, 3), (2, 3), (2, 5),
                                    (3, 2), (3, 5), (4, 2), (3, 6), (4, 5), (4, 1)]}

        board = Board(board_type='horz', num_cols=5, num_rows=5, num_players=2)
        tiles = board.get_regions('R')
        assert tiles == {'(0, 0)': [(0, 0), (0, 1), (0, 2), (0, 3), (0, 4)],
                         '(2, 0)': [(2, 0), (2, 1), (2, 2), (2, 3), (2, 4)],
                         '(4, 0)': [(4, 0), (4, 1), (4, 2), (4, 3), (4, 4)]}

        board = Board(board_type='vert', num_cols=5, num_rows=5, num_players=2)
        tiles = board.get_regions('R')
        assert tiles == {'(0, 0)': [(0, 0), (1, 0), (2, 0), (3, 0), (4, 0)],
                         '(0, 2)': [(0, 2), (1, 2), (2, 2), (3, 2), (4, 2)],
                         '(0, 4)': [(0, 4), (1, 4), (2, 4), (3, 4), (4, 4)]}


if __name__ == '__main__':
    unittest.main()
