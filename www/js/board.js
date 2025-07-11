
class Board {

	// Match Python objects in board.py
	static unitKinds = Object.freeze({
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

	static playerColors = Object.freeze({
		'T': 'transparent',
		'R': 'red',
		'G': 'green',
		'B': 'blue',
		'Y': 'yellow',
		'C': 'black',
	});

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
		let players = {};

		for (let row of strBoard.split('\n')) {
			row = row.trim();
			if (row.length < 3) continue;
			let column = []
			for (const col of row.split(' ')) {
				if (col.length !== 3) continue;
				column.push(col);
				if (col.charAt(0) !== Board.playerColors[0]) {
					players[col.charAt(0)] = '';
				}
			}
			this.board.push(column);
		}
		this.numPlayers = Object.keys(players).length;
	}

	drawBoard(playerColorId, regionsStats) {
		$(parent).empty();
		$('.draggable').remove();
		let seaObjects = [ 'ship', 'narwhal', 'walrus', 'kraken' ];
		// draw the board units and colors
		for (let row = 0; row < this.board.length; row++) {
			const odd = (row % 2 === 0) ? '' : ' odd';
			const rowElem = $(`<div class="hex-row${odd}"></div>`).appendTo(this.parent);
			for (let col = 0; col < this.board[0].length; col++) {
				const player = this.board[row][col].charAt(0);
				const unitId = this.board[row][col].slice(-2);
				const color = ' ' + Board.playerColors[player];
				const unit = (Board.unitKinds[unitId] != 'none') ? ' ' + Board.unitKinds[unitId] : '';
				let seaObj = '';
				let randomChance = (Math.floor(Math.random() * 10) % 3 === 0);  // 30% chance
				if (player === Object.keys(Board.playerColors)[0] && randomChance) {
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
		this.getTile(row, col).removeClass().addClass(['hex', Board.playerColors[color], Board.unitKinds[unit]]);
	}

	popRandom(array) {
		return array.splice(Math.floor(Math.random() * array.length), 1);
	}

	getNeighbors(_row, _col) {
		const row = parseInt(_row);
		const col = parseInt(_col);
		let allPossible;
		if (row % 2 === 0) {
			allPossible = [ [row-1, col-1], [row-1, col], [row, col-1], [row, col+1], [row+1, col-1], [row+1, col] ];
		}
		else {
			allPossible = [ [row-1, col], [row-1, col+1], [row, col-1], [row, col+1], [row+1, col], [row+1, col+1] ];
		}
		let neighbors = [];
		for (const n of allPossible) {
			if (0 <= n[0] && n[0] < this.board.length && 0 <= n[1] && n[1] < this.board[0].length) {
				// if not transparent
				if (this.board[n[0]][n[1]].charAt(0) !== Object.keys(Board.playerColors)[0]) {
					neighbors.push(n);
				}
			}
		}
		return neighbors;
	}

	toString() {
		let boardStr = '';
		for (let row = 0; row < this.board.length; row++) {
			boardStr += ((row % 2 === 0) ? '' : '  ');
			for (let col = 0; col < this.board[0].length; col++) {
				boardStr += this.board[row][col] + ' ';
			}
			boardStr += '\n';
		}
		return boardStr;
	}

}
