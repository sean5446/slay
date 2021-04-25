
class Board {

	board = [];
	num_rows = 0;
	num_cols = 0;
	num_players = 0;

  constructor(strBoard) {
  	strBoard = strBoard.trim();
		this.num_rows = strBoard.split('\n').length;
		this.num_cols = strBoard.split('\n')[0].split(' ').length;
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

  get_neighbors() {

  }

}

board = new Board(`
200 000 000 100 000 100 000 000 200 \n
 000 000 000 100 100 000 000 000 000 \n
000 000 000 100 000 100 000 000 000 \n
 000 000 100 000 000 100 100 000 000 \n
300 100 100 000 000 100 000 000 300 \n
`);
console.log(board);