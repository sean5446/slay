
// Match Python objects in board.py
Units = Object.freeze({
	'MT': 'none',
	'GR': 'grave',
	'TR': 'tree',
	'MA': 'man',
	'SP': 'spearman',
	'HU': 'hut',
	'KN': 'knight',
	'CA': 'castle',
	'BA': 'baron',
});

PlayerColors = Object.freeze({
	'T': 'transparent',
	'R': 'red',
	'G': 'green',
	'B': 'blue',
	'Y': 'yellow',
	'C': 'black',
});


class Board {
	board = [];
	numRows = 0;
	numCols = 0;
	numPlayers = 0;
	parent = null;

	constructor(strBoard, parent) {
		this.board = [];
		this.parent = parent;
		strBoard.trim();
		this.numRows = strBoard.split('\n').length - 1;
		this.numCols = strBoard.split('\n')[0].split(' ').length - 1;
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

	drawBoard(playerColorId, regionsStats) {
		$(parent).empty();
		$('.draggable').remove();
		var seaObjects = [ 'ship', 'narwhal', 'walrus', 'kraken' ];
		// draw the board units and colors
		for (let row = 0; row < this.board.length; row++) {
			const odd = (row % 2 == 0) ? '' : ' odd';
			const rowElem = $(`<div class="hex-row${odd}"></div>`).appendTo(this.parent);
			for (let col = 0; col < this.board[0].length; col++) {
				const player = this.board[row][col].charAt(0);
				const unitId = this.board[row][col].slice(-2);
				const color = ' ' + PlayerColors[player];
				const unit = (Units[unitId] != ' none') ? ' ' + Units[unitId] : '';
				var seaObj = '';
				var randomChance = (Math.floor(Math.random() * 10) % 3 == 0);  // 30% chance
				if (player === Object.keys(PlayerColors)[0] && randomChance) {
					seaObj = ' ' + this.popRandom(seaObjects);
				}
				// TODO: if player, append unit (tag with position), else just draw:
				$(`<div class="hex${color}${unit}${seaObj}"></div>`)
					.attr('data-row', row).data('row', row)
					.attr('data-col', col).data('col', col)
					.appendTo(rowElem);
			}
		}
		this.setupRegions(playerColorId, regionsStats);
	}

	setupRegions(playerColorId, regionsStats) {
		$(`.hex[data-region]`).removeAttr('data-region');

		for (const [region, v] of Object.entries(regionsStats[playerColorId])) {
			if (region == 'total') continue;
			
			for (const t of v.tiles) {
				const elem = this.getTile(t[0], t[1]);
				elem.attr('data-region', region).data('region', region);
			}
		}
	}

	getTile(row, col) {
		return $(`.hex[data-row="${row}"][data-col="${col}"]`);
	}

	updatePosition(row, col, color, unit) {
		this.board[row][col] = `${color}${unit}`;
		// TODO fix droppable class? will be reset by removeClass below
		this.getTile(row, col).removeClass()
			.addClass(['hex', 'white']);
	}

	popRandom(array) {
		return array.splice(Math.floor(Math.random() * array.length), 1);
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
				if (this.board[n[0]][n[1]].charAt(0) !== Object.keys(PlayerColors)[0]) {
					neighbors.push(n);
				}
			}
		}
		return neighbors;
	}

	toString() {
		var boardStr = '';
		var count = 0;
		for (let row = 0; row < this.board.length; row++) {
			boardStr += ((count % 2 === 0) ? '' : '  '); count++;
			for (let col = 0; col < this.board[0].length; col++) {
				boardStr += this.board[row][col] + ' ';
			}
			boardStr += '\n';
		}
		return boardStr;
	}

}
