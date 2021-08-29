
// these enums must match python enums in board.py
UnitEnum = Object.freeze({
	'00': '', '01': 'grave', '02': 'tree', '04': 'man', '08': 'spearman',
	'09': 'hut', '12': 'knight', '13': 'castle', '16': 'baron'
});
PlayerColorsEnum = Object.freeze([
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

		for (let row of strBoard.split('\n')) {
			row = row.trim();
			if (row.length < 3) continue;
			var column = []
			for (const col of row.split(' ')) {
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
		for (const n of allPossible) {
			if (0 <= n[0] && n[0] < this.board.length && 0 <= n[1] && n[1] < this.board[0].length) {
				neighbors.push(n);
			}
		}
		return neighbors;
	}

	getPlayerTiles() {
		var playerTiles = {};
		for (let row = 0; row < this.board.length; row++) {
			for (let col = 0; col < this.board[0].length; col++) {
				const player = this.board[row][col].charAt(0);
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
		const playerTiles = this.getPlayerTiles();
		for (const [k, v] of Object.entries(playerTiles)) {
			playerCounts[k] = v.length;
		}
		return playerCounts;
	}

	in_dict_of_list(item, dict_list) {
		for (const [k, v] of Object.entries(dict_list)) {
			for (const i of v) {
				if (i[0] == item[0] && i[1] == item[1]) return k;
			}
		}
		return null;
	}

	getRegions(player) {
		var player = player.toString();
		const tiles = this.getPlayerTiles()[player];
		var regions = {};
		for (const t of tiles) {
			var neighbors = this.getNeighbors(t[0], t[1]);
			for (const n of neighbors) {
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
		var regions = {};
		for (let player = 1; player < this.num_players+1; player++) {
			regions[player] = this.getRegions(player);
			for (const [k, v] of Object.entries(regions[player])) {
				if (v.length > 1) {
					var i = k.split(',');
					this.board[i[0]][i[1]] = this.board[i[0]][i[1]].charAt(0) + '09' // hut
				}
			}
		}
		return regions;
	}

	drawBoard(parent) {
		const regions = this.placeHuts(parent);

		for (let row = 0; row < this.board.length; row++) {
			const odd = (row % 2 == 0) ? '' : ' odd';
			const rowElem = $(`\t<div class="hex-row${odd}"></div>\n`).appendTo(parent);
			for (let col = 0; col < this.board[0].length; col++) {
				const player = this.board[row][col].charAt(0);
				const unit_id = this.board[row][col].slice(-2);
				const color = PlayerColorsEnum[player];
				const unit = UnitEnum[unit_id];
				const tileId = col + '-' + row;
				var region = '';
				if (player == playerColorId) {
					var k = this.in_dict_of_list([row, col], regions[playerColorId]);
					if (k != null) {
						var i = k.split(',');
						region = `region-${i[0]}-${i[1]}`;
					}
				}
				$(`<div id="tile-${tileId}" class="hex color-${color} unit-${unit} ${region}"></div>`).appendTo(rowElem)
			}
		}
		return regions;
	}

	toString() {
		var str = '';
		for (let row = 0; row < this.board.length; row++) {
			for (let col = 0; col < this.board[0].length; col++) {
				str += this.board[row][col] + ' ';
			}
			str += '\n';
		}
		return str;
	}

}
