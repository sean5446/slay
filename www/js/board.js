
// UnitValues, PlayerColors, UnitCosts must match Python objects in board.py
UnitValues = Object.freeze({
	'00': 'none',
	'01': 'grave',
	'02': 'tree',
	'04': 'man',
	'08': 'spearman',
	'09': 'hut',
	'12': 'knight',
	'13': 'castle',
	'16': 'baron'
});
PlayerColors = Object.freeze([
	'transparent',
	'red',
	'green',
	'blue',
	'yellow',
	'black'
]);
UnitCosts = Object.freeze({
	'man': 2,
	'spearman': 6,
	'knight': 18,
	'baron': 54
});


class Board {
	board = [];
	numRows = 0;
	numCols = 0;
	numPlayers = 0;

	constructor(strBoard) {
		strBoard.replace(/^\s+|\s+$/g, '');
		this.numRows = strBoard.split('\n').length - 1;
		this.numCols = strBoard.split('\n')[0].split(' ').length - 1;
		this.board = [];
		var numPlayers = {};

		for (let row of strBoard.split('\n')) {
			row = row.trim();
			if (row.length < 3) continue;
			var column = []
			for (const col of row.split(' ')) {
				if (col.length != 3) continue;
				column.push(col);
				if (col.charAt(0) != '0') {
					numPlayers[col.charAt(0)] = '';
				}
			}
			this.board.push(column);
		}
		this.numPlayers = Object.keys(numPlayers).length;
	}

	getNeighbors(row, col) {
		var row = parseInt(row);
		var col = parseInt(col);
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
				// if not transparent
				if (this.board[n[0]][n[1]].charAt(0) != '0') neighbors.push(n);
			}
		}
		return neighbors;
	}

	drawBoard(playerColorId, parent) {
		var seaObjects = [ 'ship', 'narwhal', 'walrus', 'kraken' ];
		// draw the board units and colors
		for (let row = 0; row < this.board.length; row++) {
			const odd = (row % 2 == 0) ? '' : ' odd';
			const rowElem = $(`\t<div class="hex-row${odd}"></div>\n`).appendTo(parent);
			for (let col = 0; col < this.board[0].length; col++) {
				const player = this.board[row][col].charAt(0);
				const unitId = this.board[row][col].slice(-2);
				const color = `color-${PlayerColors[player]}`;
				const unit = (UnitValues[unitId] != 'none') ? `unit-${UnitValues[unitId]}` : '';
				var seaObj = '';
				var randomChance = (Math.floor(Math.random() * 11) % 7 == 0);  // 10% chance
				if (player == 0 && randomChance) seaObj = this.popRandom(seaObjects);
				$(`<div id="tile-${row}-${col}" class="hex ${color} ${unit} ${seaObj}"></div>`).appendTo(rowElem);
			}
		}
		// make highlight-able regions for player
		const playerRegions = this.getRegions(playerColorId);
		for (const [k, v] of Object.entries(playerRegions)) {
			if (k == 'total') continue;
			const p = k.split(',');
			for (const t of v) {
				$(`#tile-${t[0]}-${t[1]}`).addClass(`region-${p[0]}-${p[1]}`);
			}
		}
	}

	popRandom(array) {
		return array.splice(Math.floor(Math.random() * array.length), 1);
	}

	getPlayersTiles() {
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
		var regions = {};
		const tiles = this.getPlayersTiles()[player];
		for (const t of tiles) {
			const neighbors = this.getNeighbors(t[0], t[1]);
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

	updatePosition(row, col, playerColorId, unit) {
		this.board[row][col] = `${playerColorId + '' + unit}`;  // lazy cast to string
	}

	toString() {
		var boardStr = '';
		var count = 0;
		for (let row = 0; row < this.board.length; row++) {
			boardStr += ((count % 2 == 0) ? '' : '  '); count++;
			for (let col = 0; col < this.board[0].length; col++) {
				boardStr += this.board[row][col] + ' ';
			}
			boardStr += '\n';
		}
		return boardStr;
	}

}
