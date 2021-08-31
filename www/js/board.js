
// UnitValue, PlayerColors, UnitCost must match Python objects in board.py
UnitValue = Object.freeze({
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
PlayerColors = Object.freeze([
	'transparent',
	'red',
	'green',
	'blue',
	'yellow',
	'black'
]);
UnitCost = Object.freeze({
	'man': 2,
	'spearman': 6,
	'knight': 18,
	'baron': 54
});

SeaObject = Object.freeze([
	'ship',
	'narwhal',
	'walrus',
	'kraken'
]);


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

	drawBoard(data, playerColorId, parent) {
		// draw the board units and colors
		for (let row = 0; row < this.board.length; row++) {
			const odd = (row % 2 == 0) ? '' : ' odd';
			const rowElem = $(`\t<div class="hex-row${odd}"></div>\n`).appendTo(parent);
			for (let col = 0; col < this.board[0].length; col++) {
				const player = this.board[row][col].charAt(0);
				const unitId = this.board[row][col].slice(-2);
				const color = PlayerColors[player];
				const unit = (UnitValue[unitId] != '') ? `unit-${UnitValue[unitId]}` : '';
				var seaObj = '';
				if (player == 0 && (Math.floor(Math.random() * 11) % 7 == 0)) {
					seaObj = SeaObject[ Math.floor(Math.random() * SeaObject.length) ];
				}
				$(`<div id="tile-${row}-${col}" class="hex color-${color} ${unit} ${seaObj}"></div>`).appendTo(rowElem)
			}
		}
		
		// make highlight-able regions for player
		const playerRegions = data.regions[playerColorId];
		for (const [k, v] of Object.entries(playerRegions)) {
			if (k == 'total') continue;
			const p = k.slice(1, -1).split(', ');
			const tiles = playerRegions[k]['tiles'];
			for (const t of tiles) {
				$(`#tile-${t[0]}-${t[1]}`).addClass(`region-${p[0]}-${p[1]}`);
			}
		}
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
