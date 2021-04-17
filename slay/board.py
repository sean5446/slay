from random import randint


PLAYER_COLORS = {
    '0': 'transparent', '1': 'green', '2': 'red', '3': 'blue', '4': 'yellow', '5': 'black'
}
UNIT_VALUES = {
    '00': '', '01': 'grave', '02': 'tree', '04': 'man', '08': 'spearman',
    '09': 'hut', '12': 'knight', '13': 'castle', '16': 'barron'
}


class Board:
    def __init__(self, num_rows, num_cols, num_players, std_dev):
        self.num_rows = num_rows
        self.num_cols = num_cols
        self.num_players = num_players
        self.board = []
        for i in range(num_rows):
            self.board.append([''] * num_cols)
        if type(std_dev) is float:
            self.fair_random_board(std_dev)
        elif std_dev == 'vert':
            self.simple_board_vert()
        else:
            self.simple_board_horz()

    def __repr__(self):
        board = ''
        for row in range(len(self.board)):
            for col in range(len(self.board[row])):
                board += f'{self.board[row][col]} '
            board += '\n'
        return board

    def get_neighbors(self, row, col):
        # this only works for this particular kind of hex grid
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
            if 0 <= n[0] < len(self.board[0]) and 0 <= n[1] < len(self.board):
                neighbors.append(n)
        return neighbors

    def fill_board_random(self):
        for row in range(len(self.board)):
            for col in range(len(self.board[row])):
                color = str(randint(0, self.num_players))
                tree = '00'
                if color != 0:
                    if randint(0, 3) == 0:
                        tree = '02'
                self.board[row][col] = f'{color}{tree}'

    def simple_board_horz(self):
        for row in range(len(self.board)):
            for col in range(len(self.board[row])):
                color = '1' if row % 2 == 0 else '2'
                self.board[row][col] = color

    def simple_board_vert(self):
        for row in range(len(self.board)):
            for col in range(len(self.board[row])):
                color = '1' if col % 2 == 0 else '2'
                self.board[row][col] = color

    def get_player_tiles(self):
        player_tiles = {}
        for row in range(len(self.board)):
            for col in range(len(self.board[0])):
                value = str(self.board[row][col])[:1]
                if not player_tiles.get(value):
                    player_tiles[value] = [(row, col)]
                else:
                    player_tiles[value] += [(row, col)]
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

    def fair_random_board(self, accept_std_dev=1.2):
        num_generated = 0
        while True:
            self.fill_board_random()
            player_tiles = self.get_player_tiles()
            std_dev = self.std_dev_player_tiles()
            num_generated += 1
            if std_dev < accept_std_dev:
                return self.board, player_tiles, std_dev, num_generated

    def get_player_turn_order(self):
        player_tiles = self.get_player_tile_count()
        order = {k: v for k, v in sorted(player_tiles.items(), key=lambda item: item[1])}
        del order['0']  # 0 is not a player
        return list(order.keys())

    def is_in_map(self, player_tiles, neighbors):
        for pk, pv in player_tiles.items():
            for nv in neighbors:
                if nv in pv:
                    return pk
        return None

    def get_contiguous_player_tiles(self, player):
        player = str(player)
        tiles = self.get_player_tiles()[player]
        regions = {}
        discovered = []
        for t in tiles:
            if t in discovered:
                continue
            discovered += [t]
            neighbors = self.get_neighbors(t[0], t[1])
            for n in neighbors:
                if n in discovered:
                    continue
                discovered += [n]
                is_player = self.board[n[0]][n[1]][:1] == player
                if is_player:
                    k = self.is_in_map(regions, neighbors)
                    if k:
                        regions[k] += [t, n]
                    else:
                        regions[t] = [t, n]
        return regions

    def render_to_html(self):
        html = ''
        # insert current men
        html += ''
        for row in range(len(self.board)):
            html += f'\t<div class="hex-row{"" if row % 2 == 0 else " odd"}">\n'
            for col in range(len(self.board[row])):
                color = PLAYER_COLORS[self.board[row][col][:1]]
                unit_id = self.board[row][col][1:3]
                unit = UNIT_VALUES[unit_id]
                tile_id = f'{row}-{col}'
                html += f'\t\t<div id="tile-{tile_id}" class="hex {color} {unit}"></div>\n'
            html += '\t</div>\n'
        return html

    @staticmethod
    def str_to_html(board):
        html = ''
        i = 0
        for row in board.split('\n'):
            html += f'\t<div class="hex-row{"" if i % 2 == 0 else " odd"}">\n'
            for col in row.split(' '):
                if len(col) != 3:
                    continue
                color = PLAYER_COLORS[col[:1]]
                unit_id = col[1:3]
                unit = UNIT_VALUES[unit_id]
                tile_id = f'{row}-{col}'
                html += f'\t\t<div id="tile-{tile_id}" class="hex {color} {unit}"></div>\n'
            html += '\t</div>\n'
            i += 1
        return html
