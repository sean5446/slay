
import unittest

from slay.board import Board


class TestBoard(unittest.TestCase):

    def test_get_neighbors(self):
        board = Board(board_type=5.0, num_rows=4, num_cols=4, num_players=1)
        assert board.get_neighbors(0, 0) == [(0, 1), (1, 0)]
        assert board.get_neighbors(1, 0) == [(0, 0), (0, 1), (1, 1), (2, 0), (2, 1)]
        assert board.get_neighbors(3, 0) == [(2, 0), (2, 1), (3, 1)]
        assert board.get_neighbors(3, 3) == [(2, 3), (3, 2)]
        assert board.get_neighbors(0, 2) == [(0, 1), (0, 3), (1, 1), (1, 2)]
        assert board.get_neighbors(0, 3) == [(0, 2), (1, 2), (1, 3)]
        assert board.get_neighbors(2, 2) == [(1, 1), (1, 2), (2, 1), (2, 3), (3, 1), (3, 2)]
        assert board.get_neighbors(1, 1) == [(0, 1), (0, 2), (1, 0), (1, 2), (2, 1), (2, 2)]
        print('tests passed!')

    def test_fair_random_board(self):
        board = Board(board_type=1.2, num_rows=5, num_cols=9, num_players=5)
        fair_grid, player_tiles, std_dev, num_generated = board.fair_random_board(1.2)
        print(board)
        print(f"std dev: {std_dev}")
        print(f"num gen: {num_generated}")
        assert std_dev <= 1.2
        assert len(board.get_player_tile_count().keys()) == 6  # 6 with trees

    def test_get_player_turn_order(self):
        board = Board(board_type=1.2, num_cols=5, num_rows=5, num_players=5)
        print(board.get_player_turn_order())

    def test_render_to_html(self):
        board = Board(board_type=1.2, num_cols=5, num_rows=5, num_players=5)
        print(board.render_to_html())

    def test_get_regions(self):
        board_str = """
        000 000 000 100 000 100 000 000 000
         000 000 000 100 100 000 000 000 000
        000 000 000 100 000 100 000 000 000
         000 000 100 000 000 100 100 000 000
        000 100 100 000 000 100 000 000 000
        """
        board = Board(board_str)
        tiles = board.get_regions(1)
        assert tiles == {(0, 5): [(0, 5), (1, 4), (0, 3), (1, 3), (2, 3),
                         (2, 5), (3, 2), (3, 5), (4, 2), (3, 6), (4, 5), (4, 1)]}

        board = Board(board_type='horz', num_cols=5, num_rows=5, num_players=2)
        tiles = board.get_regions(1)
        assert tiles == {(0, 0): [(0, 0), (0, 1), (0, 2), (0, 3), (0, 4)],
                         (2, 0): [(2, 0), (2, 1), (2, 2), (2, 3), (2, 4)],
                         (4, 0): [(4, 0), (4, 1), (4, 2), (4, 3), (4, 4)]}

        board = Board(board_type='vert', num_cols=5, num_rows=5, num_players=2)
        tiles = board.get_regions(1)
        assert tiles == {(0, 0): [(0, 0), (1, 0), (2, 0), (3, 0), (4, 0)],
                         (0, 2): [(0, 2), (1, 2), (2, 2), (3, 2), (4, 2)],
                         (0, 4): [(0, 4), (1, 4), (2, 4), (3, 4), (4, 4)]}


if __name__ == '__main__':
    unittest.main()
