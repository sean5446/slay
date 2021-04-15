
import unittest

from slay.board import Board


class TestBoard(unittest.TestCase):

    def test_get_neighbors(self):
        board = Board(num_rows=4, num_cols=4, num_players=1, std_dev=5)
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
        board = Board(num_rows=5, num_cols=9, num_players=5, std_dev=1.2)
        fair_grid, player_tiles, std_dev, num_generated = board.fair_random_board(1.2)
        print(board)
        print(f"std dev: {std_dev}")
        print(f"num gen: {num_generated}")
        assert std_dev <= 1.2
        assert len(board.get_player_tile_count().keys()) == 6  # 6 with trees

    def test_get_player_turn_order(self):
        board = Board(num_cols=5, num_rows=5, num_players=5, std_dev=1.2)
        print(board.get_player_turn_order())

    def test_render_to_html(self):
        board = Board(num_cols=5, num_rows=5, num_players=5, std_dev=1.2)
        print(board.render_to_html())

    def test_get_contiguous_player_tiles(self):
        board = Board(num_cols=5, num_rows=5, num_players=2, std_dev='horz')
        tiles = board.get_contiguous_player_tiles(1)
        assert tiles == {(0, 0): [(0, 0), (0, 1), (0, 2), (0, 3)],
                         (2, 0): [(2, 0), (2, 1), (2, 2), (2, 3)],
                         (4, 0): [(4, 0), (4, 1), (4, 2), (4, 3)]}
        board = Board(num_cols=5, num_rows=5, num_players=2, std_dev='vert')
        tiles = board.get_contiguous_player_tiles(1)
        assert tiles == {(0, 0): [(0, 0), (1, 0), (2, 0), (3, 0)],
                         (0, 2): [(0, 2), (1, 2), (2, 2), (3, 2)],
                         (0, 4): [(0, 4), (1, 4), (2, 4), (3, 4)]}

