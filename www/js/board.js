
// these enums must match python enums in board.py
UnitEnum = Object.freeze({
	'00': '', '01': 'grave', '02': 'tree', '04': 'man', '08': 'spearman',
	'09': 'hut', '12': 'knight', '13': 'castle', '16': 'barron'
	//'grave': 1, 'tree': 2, 'man': 4, 'spearman': 8, 'hut': 9, 'knight': 12, 'castle': 13, 'barron': 16
});

PlayerColorsEnum = Object.freeze([
	//'0': 'transparent', '1': 'red', '2': 'green', '3': 'blue', '4': 'yellow', '5': 'black'
	'transparent', 'red', 'green', 'blue', 'yellow', 'black'
]);

class Board {
	board = [];
	num_rows = 0;
	num_cols = 0;
	num_players = 0;

  constructor(strBoard) {
		strBoard.replace(/^\s+|\s+$/g, '');
		this.num_rows = strBoard.split('\n').length - 1;
		this.num_cols = strBoard.split('\n')[0].split(' ').length - 1;
		this.board = [];
		var num_players = {};

		for (var row of strBoard.split('\n')) {
			row = row.trim();
			if (row.length < 3) continue;
			var column = []
			for (var col of row.split(' ')) {
				if (col.length != 3) continue;
				column.push(col);
				if (col.charAt(0) != '0') {
					num_players[col.charAt(0)] = '';
				}
			}
			this.board.push(column);
		}
		this.num_players = Object.keys(num_players).length;
  }

	getNeighbors(row, col) {
		var allPossible = null;
		if (row % 2 == 0) {
			allPossible = [ [row-1, col-1], [row-1, col], [row, col-1], [row, col+1], [row+1, col-1], [row+1, col] ];
		}
		else {
			allPossible = [ [row-1, col], [row-1, col+1], [row, col-1], [row, col+1], [row+1, col], [row+1, col+1] ];
		}
		var neighbors = [];
		for (var n of allPossible) {
			if (0 <= n[0] && n[0] < this.board.length && 0 <= n[1] && n[1] < this.board[0].length) {
				neighbors.push(n);
			}
		}
		return neighbors;
	}

	getPlayerTiles() {
		var playerTiles = {};
		for (var row = 0; row < this.board.length; row++) {
			for (var col = 0; col < this.board[0].length; col++) {
				var player = this.board[row][col].charAt(0);
				if (!playerTiles.hasOwnProperty(player)) {
					playerTiles[player] = [[row, col]];
				}
				else {
					playerTiles[player].push([row, col]);
				}
			}
		}
		return playerTiles;
	}

	getPlayerTileCount() {
		var playerCounts = {};
		var playerTiles = this.getPlayerTiles();
		for (const [k, v] of Object.entries(playerTiles)) {
			playerCounts[k] = v.length;
		}
		return playerCounts;
	}

	in_dict_of_list(item, dict_list) {
		for (const [k, v] of Object.entries(dict_list)) {
			for (const i of v) {
				if (JSON.stringify(i) === JSON.stringify(item)) return k;
			}
		}
		return null;
	}

	getRegions(player) {
		var player = player.toString();
		var tiles = this.getPlayerTiles()[player];
		var regions = {};
		for (var t of tiles) {
			var neighbors = this.getNeighbors(t[0], t[1]);
			for (var n of neighbors) {
				var n_color = this.board[n[0]][n[1]].charAt(0);
				if (n_color == player) {
					var kn = this.in_dict_of_list(n, regions);
					var kt = this.in_dict_of_list(t, regions);
					if (kn == null && kt == null) {
						regions[t] = [t, n]
					}
					else if (kn == null && kt != null) {
						regions[kt].push(n);
					}
					else if (kn != null && kt != null) {
						if (kn != kt) {
							for (const v of regions[kt]) {
								regions[kn].push(v);
							}
							delete regions[kt];
						}
					}
				}
			}
		}
		return regions;
	}

	placeHuts() {
		for (var player = 1; player < this.num_players+1; player++) {
			var regions = this.getRegions(player);
			for (const [k, v] of Object.entries(regions)) {
				if (v.length > 1) {
					var i = k.split(',');
					this.board[i[0]][i[1]] = this.board[i[0]][i[1]].charAt(0) + '09' // hut
				}
			}
		}
	}

  drawBoard(parent, playerColorId) {
		// regions

		this.placeHuts(parent);

		for (let row = 0; row < this.board.length; row++) {
			var odd = (row % 2 == 0) ? '' : ' odd';
			var rowElem = $(`\t<div class="hex-row${odd}"></div>\n`).appendTo(parent);
			for (let col = 0; col < this.board[0].length; col++) {
				var player = this.board[row][col].charAt(0);
				var unit_id = this.board[row][col].slice(-2);
				var color = PlayerColorsEnum[player];
				var unit = UnitEnum[unit_id];
				var tileId = col + '-' + row;
				$(`<div id="tile-${tileId}" class="hex ${color} ${unit}"></div>`).appendTo(rowElem)
			}
		}
  }

  getColor(classes) {
		var color = classes.filter(function(n) {
			return PlayerColorsEnum.indexOf(n) !== -1;
		});
		return color;
	}

	getUnit(classes) {
		var unit = classes.filter(function(n) {
			return UnitEnum[n];
		});
		return unit;
	}

	getUnitFromStrength(strength) {
		for (const [key, value] of Object.entries(UnitEnum)) {
			if (value == strength) return key;
		}
	}

}
