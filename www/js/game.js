
var _dragStartPosition = null;
var _accessToken = null;
var _displayName = null;

$(document).ready(function() {
	$.ajax({
		type: "GET",
		dataType: "json",
		url: `/firebase`,
		success: function(data) {
			firebaseInit(data);
		},
		error: function(data) {
			console.log(data)
		}
	});
});

function firebaseInit(data) {
	firebase.initializeApp(data);
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// user is signed in
			user.getIdToken().then(function(accessToken) {
				// user.email, user.photoURL
				_accessToken = accessToken;
				_displayName = user.displayName;
				initGame(_displayName, accessToken);
			});
		} else {
			// user is signed out
			window.location.replace('/');
		}
	}, function(error) {
		console.log(error);
	});
}

function post(url, data, callback) {
	$.ajax({
		url: url,
		type: "POST",
		dataType: "json",
		contentType: 'application/json; charset=utf-8',
		data: JSON.stringify(data),
		success: callback,
		error: function(data) {
			console.log(data);
		}
	});
}

function initGame() {
	post(`${window.location.pathname}`,  // /game/<id>
		{ 'token': _accessToken },
		function(data) {
			for (const player of data.game.players) {
				if (player.user.username === _displayName) {
					const board = new Board(data.game.board.board);
					const playerColorId = player.color;
					const playerColor = PlayerColors[player.color];
					
					// setup UI elements - 95 in height comes from .hex size
					if (window.innerWidth > 1000) {
						$('#map').removeClass('vertical-map').addClass('horizontal-map').height(board.numRows * 95);
						$('#panel').removeClass('vertical-panel').addClass('horizontal-panel');
					}

					board.drawBoard(playerColorId, data.regions, '#tiles');
					showPlayersStats(data.game);

					if (data.game.current_turn === playerColorId) {
						setupButtons(true);
						setupClickTouch(board, playerColorId, playerColor, data);
					} else {
						setupButtons(false);
					}
					return;
				}
			}
		}
	);
}

function setupClickTouch(board, playerColorId, playerColor, data) {
	// mousedown touchstart are alternatives
	$(document).on('click touch', '.hex', function() {
		// remove all white hex (unselect)
		$('[class*=region][class*=white]').each(function() {
			$(this).removeClass('white').addClass(playerColor);
		});

		// selected friendly tile
		if ($(this).attr('class').includes(playerColor)) {
			// solo square has no region
			if (!$(this).data('region')) return;

			// if a region, set droppable
			const currentRegion = $(this).data('region');
			setupDroppable(board, playerColorId, playerColor, currentRegion);

			// color selected region white
			$(`.${currentRegion}`).each(function() {
				$(this).removeClass(playerColor).addClass('white');
			});

			// update region stats
			showRegionStats(data, playerColorId, currentRegion);

			// if they have money, allow user to drag a unit
			const hasMoney = true;  // TODO 
			$('#unit').children().remove();
			if (hasMoney) {
				$('<div class="unit man draggable"></div>')
					.data('row', -1)
					.data('col', -1)
					.appendTo('#unit');
			}
			setupDraggable();
		}
		// selected enemy tile
		else {
			$('#unit').children().remove();
			showRegionStats();
		}
	});
}

function showRegionStats(data, playerColorId, region) {
	let savings = '';
	let income = '';
	let wages = '';
	let balance = '';
	if (data && playerColorId && region) {
		const r = `(${region.split('-')[1]}, ${region.split('-')[2]})`;
		for (const [k, v] of Object.entries(data.game.players)) {
			if (v.color === playerColorId) {
				savings = JSON.parse(v.savings)[r];
			}
		}
	}
	$('#savings').html(`Savings: ${savings}`);
	$('#income').html(`Income: ${income}`);
	$('#wages').html(`Wages: ${wages}`);
	$('#balance').html(`Balance: ${balance}`);
	$('#money').html(`Money: `);
}

function setupDraggable() {
	$('.draggable').draggable({
		revert: 'invalid',
		start: function(event, ui) {
			_dragStartPosition = ui.helper.position();
		}
	});
}

function setupDroppable(board, playerColorId, playerColor, currentRegion) {
	const p = currentRegion.split('-');
	$(`.region-${p[1]}-${p[2]}`).each(function() {
		$(this).addClass('droppable');
		const e = this.id.split('-');
		const borderTiles = board.getNeighbors(e[1], e[2]);
		for (const b of borderTiles) {
			$(`#tile-${b[0]}-${b[1]}`).addClass('droppable');
		}
	});

	$('.droppable').droppable({
		accept: '.draggable',
		drop: function(event, ui) {
			const draggable = $(ui.draggable[0]);
			const droppable = $(this);
			drop(draggable, droppable, board, playerColorId, playerColor, currentRegion);
		}
	});
}

function showPlayersStats(data) {
	$('#players').html('');
	// turn colors are stored in db as a json string
	for (const playerColorId of JSON.parse(data.turn_colors)) {
		let bold = '';
		if (playerColorId === data.current_turn) bold = 'font-weight: bold;';
		// TODO calculate total from regions instead?
		const total = $(`.${PlayerColors[playerColorId]}`).length;
		let name = '??';
		for (let i = 0; i < data.players.length; i++) {
			if (data.players[i].color === playerColorId) {
				name = data.players[i].user.username;
				break;
			}
		}
		$('#players').append(
			`<div style="${bold} color: ${PlayerColors[playerColorId]}">${name}: ${total}</div>`
		);
	}
}

function resetDraggable(draggable) {
	const pos = $('#unit').offset();
	draggable.offset({top: pos.top, left: pos.left});
	// could move it slowly here
	draggable.css({top: _dragStartPosition.top, left: _dragStartPosition.left});
}

function drop(draggable, droppable, board, playerColorId, playerColor, currentRegion) {
	const from = [draggable.data().row, draggable.data().col];
	const to = [droppable.data().row, droppable.data().col];
	const move = [to, from];

	post(`${window.location.pathname}/validate`,  // /game/<id>/validate
		{ 'token': _accessToken, 'board': board, 'player_color_id': playerColorId, 'moves': move },
		function(data) {
			if (data) {
				const pos = droppable.offset();
				draggable.detach().appendTo(droppable);
				draggable.offset({top: pos.top, left: pos.left + 25});
				draggable.draggable('disable');
				
				// update board
				// droppable.addClass([currentRegion], `unit-${dragUnit}`);
			}
			else {
				// display error?
				resetDraggable(draggable)
			}
		}
	);
}

function setupButtons(board) {
	// TODO: confirm and alert are being removed from browsers!?
	let resetButton = $('#buttonReset');
	let endTurnButton = $('#buttonEndTurn');

	if (board) {
		resetButton.unbind().bind('click', onReset);
		endTurnButton.unbind().bind('click', onEndTurn);
	}
	else {
		resetButton.button({ disabled: true });
		endTurnButton.button({ disabled: true });
	}
}

function onReset() {
	if (confirm('Are you sure you want to reset all moves?')) {
		initGame();
	}
}

function onEndTurn() {
	if (confirm('Are you sure you want to end your turn?')) {
		// submit moves
		alert('Turn ended!');
	}
}
