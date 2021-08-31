
import json
from random import randint


class Board:
    # these enums must match Javascript objects in game.js - using strings to format directly to css
    PLAYER_COLORS = {
        '0': 'transparent',
        '1': 'red',
        '2': 'green',
        '3': 'blue',
        '4': 'yellow',
        '5': 'black'
    }
    UNIT_VALUES = {
        '00': '',
        '01': 'grave',
        '02': 'tree',
        '04': 'man',
        '08': 'spearman',
        '09': 'hut',
        '12': 'knight',
        '13': 'castle',
        '16': 'baron'
    }
    UNIT_COST = {
        'man': 2,
        'spearman': 6,
        'knight': 18,
        'baron': 54
    }

    def __init__(self, board_type, num_rows=0, num_cols=0, num_players=0):
        self.num_rows = num_rows
        self.num_cols = num_cols
        self.num_players = num_players
        self.board_type = board_type
        self.board = []
        for i in range(num_rows):
            self.board.append([''] * num_cols)
        if type(board_type) is float:
            self.fair_random_board(board_type)
        elif board_type == 'vert':
            self.simple_board_vert()
        elif board_type == 'horz':
            self.simple_board_horz()
        else:
            self.board_from_str(board_type)

    def __repr__(self):
        board = ''
        count = 0
        for row in range(len(self.board)):
            board += '' if count % 2 == 0 else '  '
            count += 1
            for col in range(len(self.board[row])):
                board += f'{self.board[row][col]} '
            board += '\n'
        return board

    def board_from_str(self, board):
        board = board.strip()
        self.num_rows = len(board.split('\n')) - 1
        self.num_cols = len(board.split('\n')[0].split(' ')) - 1
        self.board = []
        num_players = {}
        for row in board.split('\n'):
            row = row.strip()
            if len(row) < 3:
                continue
            column = []
            for col in row.split(' '):
                if len(col) != 3:
                    continue
                column.append(col)
                if col[:1] != '0':  # 0 is not a player
                    num_players[col[:1]] = ''
            self.board.append(column)
        self.num_players = len(num_players.keys())

    def fill_board_random(self):
        for row in range(len(self.board)):
            for col in range(len(self.board[row])):
                color = str(randint(0, self.num_players))
                tree = '00'
                if color != '0':
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
                break
        self.place_huts()
        return self.board, player_tiles, std_dev, num_generated

    def get_player_turn_order(self):
        player_tiles = self.get_player_tile_count()
        order = {k: v for k, v in sorted(player_tiles.items(), key=lambda item: item[1])}
        del order['0']  # 0 is not a player
        return ','.join(order.keys())

    def in_dict_of_list(self, item, dict_list):
        for k, v in dict_list.items():
            if item in v:
                return k
        return None

    def get_regions(self, player):
        player = str(player)
        tiles = self.get_player_tiles()[player]
        regions = {}
        for t in tiles:
            neighbors = self.get_neighbors(t[0], t[1])
            for n in neighbors:
                n_color = self.board[n[0]][n[1]][:1]
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

    def get_regions_stats(self, players):
        regions = {}
        for player in players:
            color = player.color
            player_regions = self.get_regions(color)
            regions[color] = {}
            regions[color]['total'] = 0
            for k, v in player_regions.items():
                regions[color][k] = {}
                regions[color][k]['tiles'] = v
                regions[color]['total'] += len(v)
                income, wages = self.get_income_and_wages(v)
                savings = json.loads(player.savings)
                regions[color][k]['savings'] = savings[k]
                regions[color][k]['income'] = income
                regions[color][k]['wages'] = wages
                regions[color][k]['balance'] = savings[k] + income - wages
        return regions

    def get_income_and_wages(self, tiles):
        income = 0
        wages = 0
        for t in tiles:
            tile_unit = int(self.board[t[0]][t[1]][1:])
            if tile_unit != 2:  # not a tree
                income += 1
            if tile_unit > 2 and tile_unit != 9 and tile_unit != 13:  # a unit but not a hut or castle
                unit_name = self.UNIT_VALUES[tile_unit]
                wages += self.UNIT_COST[unit_name]
        return income, wages

    def place_huts(self):
        for player in range(1, self.num_players + 1):
            regions = self.get_regions(player)
            for k, v in regions.items():
                if len(v) > 1:
                    nums = k[1:-1]
                    row = int(nums.split(',')[0].strip())
                    col = int(nums.split(',')[1].strip())
                    self.board[row][col] = self.board[row][col][:1] + '09'  # place hut

    def render_to_html(self):
        regions = {}
        for player in range(1, self.num_players + 1):
            regions[player] = self.get_regions(player)

        html = ''
        for row in range(len(self.board)):
            html += f'\t<div class="hex-row{"" if row % 2 == 0 else " odd"}">\n'
            for col in range(len(self.board[row])):
                player = self.board[row][col][:1]
                region = ''
                if player != '0':
                    player_regions = regions[int(player)]
                    for k, v in player_regions.items():
                        if len(v) > 1 and (row, col) in v:
                            region = f'region{k[0]}-{k[1]}'
                unit_id = self.board[row][col][1:3]
                unit = f'unit-{self.UNIT_VALUES[unit_id]}'
                color = f'color-{self.PLAYER_COLORS[player]}'
                tile_id = f'tile-{row}-{col}'
                html += f'\t\t<div id="{tile_id}" class="hex {color} {unit} {region}"></div>\n'
            html += '\t</div>\n'
        return html
