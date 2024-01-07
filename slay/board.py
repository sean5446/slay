
from random import randint


class Board:
    # these enums correspond to Javascript objects in board.js
    PLAYER_COLORS = {
        0: 'T',  # transparent
        1: 'R',  # red
        2: 'G',  # green
        3: 'B',  # blue
        4: 'Y',  # yellow
        5: 'C'   # coal
    }
    UNIT_VALUES = {
        'MT': 0,  # empty
        'GR': 1,  # grave
        'TR': 2,  # tree
        'MA': 4,  # man
        'SP': 8,  # spearman
        'HU': 9,  # hut
        'KN': 12,  # knight
        'CA': 13,  # castle
        'BA': 16,  # baron
    }
    UNIT_COSTS = {
        'MA': 2,  # man
        'SP': 6,  # spearman
        'KN': 18,  # knight
        'BA': 54,  # baron
        'CA': 12,  # castle
    }

    def __init__(self, board_type, num_rows=0, num_cols=0, num_players=0):
        self.board = []
        self.num_players = num_players
        for _ in range(num_rows):
            self.board.append([''] * num_cols)
        if type(board_type) is float:
            self._fair_random_board(board_type)
        elif type(board_type) is list:
            self.board = board_type
        elif board_type == 'vert':
            self._simple_board_vert()
        elif board_type == 'horz':
            self._simple_board_horz()
        else:
            self._board_from_str(board_type)
        self.num_players = len(self.get_player_tiles().keys())
        self.num_rows = len(self.board)
        self.num_cols = len(self.board[0])

    def __repr__(self):
        board = ''
        for row in range(len(self.board)):
            board += '' if row % 2 == 0 else '  '
            for col in range(len(self.board[row])):
                board += f'{self.board[row][col]} '
            board += '\n'
        return board

    def _board_from_str(self, board):
        for row in board.split('\n'):
            row = row.strip()
            if len(row) < 3:
                continue
            column = []
            for col in row.split(' '):
                if len(col) != 3:
                    raise Exception('col data had less than 3 chars')
                column.append(col)
            self.board.append(column)

    def _fill_board_random(self):
        for row in range(len(self.board)):
            for col in range(len(self.board[row])):
                color = self.PLAYER_COLORS.get(randint(0, self.num_players))
                tree = 'MT'
                if color != self.PLAYER_COLORS[0]:
                    if randint(0, 3) == 0:
                        tree = 'TR'
                self.board[row][col] = f'{color}{tree}'

    def _simple_board_horz(self):
        for row in range(len(self.board)):
            for col in range(len(self.board[row])):
                color = 'R' if row % 2 == 0 else 'B'
                self.board[row][col] = color

    def _simple_board_vert(self):
        for row in range(len(self.board)):
            for col in range(len(self.board[row])):
                color = 'R' if col % 2 == 0 else 'B'
                self.board[row][col] = color

    def get_neighbors(self, row, col):
        # this only works for a grid where even are shifted left, odd shifted right
        if row % 2 == 0:
            all_possible = [
                (row - 1, col - 1), (row - 1, col), (row, col - 1), (row, col + 1), (row + 1, col - 1), (row + 1, col)
            ]
        else:
            all_possible = [
                (row - 1, col), (row - 1, col + 1), (row, col - 1), (row, col + 1), (row + 1, col), (row + 1, col + 1)
            ]
        neighbors = []
        for n in all_possible:
            if 0 <= n[0] < len(self.board) and 0 <= n[1] < len(self.board[1]):
                neighbors.append(n)
        return neighbors

    def get_player_tiles(self):
        player_tiles = {}
        for row in range(len(self.board)):
            for col in range(len(self.board[0])):
                color = self.get_color(row, col)
                if color == self.PLAYER_COLORS[0]:
                    continue
                if not player_tiles.get(color):
                    player_tiles[color] = [(row, col)]
                else:
                    player_tiles[color] += [(row, col)]
        player_tiles.pop(self.PLAYER_COLORS[0], None)
        return player_tiles

    def get_player_tile_count(self):
        player_counts = {}
        player_tiles = self.get_player_tiles()
        for k, v in player_tiles.items():
            player_counts[k] = len(v)
        return player_counts

    def std_dev_player_tiles(self):
        player_counts = self.get_player_tile_count()
        avg = sum(player_counts.values()) / len(player_counts)
        total = 0
        for k, v in player_counts.items():
            total += (v - avg) ** 2
        return (total / len(player_counts)) ** 0.5

    def _fair_random_board(self, accept_std_dev=1.2):
        num_generated = 0
        while True:
            self._fill_board_random()
            player_tiles = self.get_player_tiles()
            std_dev = self.std_dev_player_tiles()
            num_generated += 1
            if std_dev < accept_std_dev:
                break
        self.place_huts()
        return self.board, player_tiles, std_dev, num_generated

    def get_player_turn_order(self):
        player_tiles = self.get_player_tile_count()
        order = {k: v for k, v in sorted(player_tiles.items(), key=lambda item: item[1])}
        return list(order.keys())

    def in_dict_of_list(self, item, dict_list):
        for k, v in dict_list.items():
            if item in v:
                return k
        return None

    def get_regions(self, player):
        player = player
        tiles = self.get_player_tiles()[player]
        regions = {}
        for t in tiles:
            neighbors = self.get_neighbors(t[0], t[1])
            for n in neighbors:
                n_color = self.get_color(n[0], n[1])
                if n_color == player:
                    kn = self.in_dict_of_list(n, regions)
                    kt = self.in_dict_of_list(t, regions)
                    if not kn and not kt:
                        regions[str(t)] = [t, n]    # keys need to be strings to jsonify
                    elif not kn and kt:
                        regions[str(kt)] += [n]
                    elif kn and kt:
                        if kn != kt:
                            for v in regions[str(kt)]:
                                regions[str(kn)] += [v]
                            del(regions[str(kt)])
        return regions

    def place_huts(self):
        for player in range(1, self.num_players + 1):
            regions = self.get_regions(self.PLAYER_COLORS.get(player))
            for k, v in regions.items():
                if len(v) > 1:
                    nums = k[1:-1]
                    row = int(nums.split(',')[0].strip())
                    col = int(nums.split(',')[1].strip())
                    self.board[row][col] = self.get_color(row, col) + 'HU'  # place hut

    def get_income_and_wages(self, tiles):
        income = 0
        wages = 0
        for t in tiles:
            unit = self.get_unit(t[0], t[1])
            if unit != 'TR':
                income += 1
            if unit == 'MA' or unit == 'SP' or unit == 'KN' and unit == 'BA':
                wages += self.UNIT_COSTS[unit]
        return income, wages

    def get_regions_stats(self):
        regions = {}
        for i in range(1, self.num_players + 1):
            color = self.PLAYER_COLORS[i]
            player_regions = self.get_regions(self.PLAYER_COLORS[i])
            regions[color] = {}
            regions[color]['total'] = 0
            for k, v in player_regions.items():
                regions[color][k] = {}
                regions[color][k]['tiles'] = v
                regions[color]['total'] += len(v)
        return regions

    def update_position(self, row, col, color, unit):
        self.board[row][col] = f'{color}{unit}'
        # TODO if regions get combined, remove a hut

    def get_unit(self, row, col):
        return self.board[row][col][1:]

    def get_color(self, row, col):
        return self.board[row][col][:1]

