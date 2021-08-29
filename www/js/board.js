
// these enums must match python enums in board.py
UnitEnum = Object.freeze({
	'00': '',
	'01': 'grave',
	'02': 'tree',
	'04': 'man',
	'08': 'spearman',
	'09': 'hut',
	'12': 'knight',
	'13': 'castle',
	'16': 'baron'
});

PlayerColorsEnum = Object.freeze([
	'transparent',
	'red',
	'green',
	'blue',
	'yellow',
	'black'
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

	drawBoard(data, playerColorId, parent) {
		// draw the board units and colors
		for (let row = 0; row < this.board.length; row++) {
			const odd = (row % 2 == 0) ? '' : ' odd';
			const rowElem = $(`\t<div class="hex-row${odd}"></div>\n`).appendTo(parent);
			for (let col = 0; col < this.board[0].length; col++) {
				const player = this.board[row][col].charAt(0);
				const unit_id = this.board[row][col].slice(-2);
				const color = PlayerColorsEnum[player];
				const unit = (UnitEnum[unit_id] != '') ? `unit-${UnitEnum[unit_id]}` : '';
				$(`<div id="tile-${row}-${col}" class="hex color-${color} ${unit}"></div>`).appendTo(rowElem)
			}
		}
		
		// make highlight-able regions for player
		const player_regions = data.regions[playerColorId];
		for (const [k, v] of Object.entries(player_regions)) {
			if (k == 'total') continue;
			const sliz = k.slice(1, -1).split(', ');
			const row = sliz[0];
			const col = sliz[1];
			const tiles = player_regions[k]['tiles'];
			for (const t of tiles) {
				$(`#tile-${t[0]}-${t[1]}`).addClass(`region-${row}-${col}`);
			}
		}
	}

	toString() {
		var board_str = '';
		var count = 0;
		for (let row = 0; row < this.board.length; row++) {
			board_str += ((count % 2 == 0) ? '' : '  '); count++;
			for (let col = 0; col < this.board[0].length; col++) {
				board_str += this.board[row][col] + ' ';
			}
			board_str += '\n';
		}
		return board_str;
	}

}
