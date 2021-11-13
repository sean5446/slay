
var _dragStartPosition = null;
var _accessToken = null;

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
				initGame(user.displayName, user.email, accessToken);
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

function initGame(displayName, email, accessToken) {
	post(`${window.location.pathname}`,  // /game/<id>
		{ 'token': accessToken },
		function(data) {
			_accessToken = accessToken;
			for (const player of data.game.players) {
				if (player.user.username === displayName) {
					const board = new Board(data.game.board.board);
					const playerColorId = player.color;
					const playerColor = PlayerColors[player.color];
					
					// setup UI elements - 95 in height comes from .hex size
					if (window.innerWidth > 1000) {
						$('#map').removeClass('vertical-map').addClass('horizontal-map').height(board.numRows * 95);
						$('#panel').removeClass('vertical-panel').addClass('horizontal-panel');
					}

					board.drawBoard(playerColorId, data.regions, '#tiles');
					showPlayerStats(data.game);

					if (data.game.current_turn_color === playerColorId) {
						setupButtons(true);
						setupClickTouch(board, playerColorId, playerColor);
					} else {
						setupButtons(false);
					}
					return;
				}
			}
		}
	);
}

function getRegionsStats(board) {
	post("/regions",
		 { 'token': _accessToken, 'board': board },
		 function(data) {
			console.log(data);
		 }
	);
}

function setupClickTouch(board, playerColorId, playerColor) {
	// mousedown touchstart are alternatives
	$(document).on('click touch', '.hex', function() {
		// remove all white hex (unselect)
		$('[class*=region][class*=white]').each(function() {
			$(this).removeClass('color-white').addClass(`color-${playerColor}`);
		});

		// selected friendly tile
		if ($(this).attr('class').includes(`color-${playerColor}`)) {
			// if a region, set droppable
			var currentRegion = getClass($(this), 'region');
			if (currentRegion === undefined) return;  // solo square has no region
			const c = currentRegion;
			currentRegion = 'region-' + currentRegion.join('-');
			console.log(`currentRegion: ${currentRegion}`);
			setupDroppable(board, playerColorId, playerColor, currentRegion);

			// color selected region white
			$(`.${currentRegion}`).each(function() {
				$(this).removeClass(`color-${playerColor}`).addClass('color-white');
			});

			// update region stats

			// allow user to drag a unit
			$('#unit').html('<div class="unit-man draggable"></div>');
			setupDraggable();
		}
		// selected enemy tile
		else if ($(this).attr('class').match(/color-*/)) {
			showRegionStats('', '', '', '');
			$('#unit').html('<div></div>');
		}
	});
}

function showRegionStats(savings, income, wages, balance) {
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

function showPlayerStats(data) {
	$('#players').html('');
	for (const playerColorId of JSON.parse(data.turn_colors)) {
		let bold = '';
		if (playerColorId === data.current_turn_color) bold = 'font-weight: bold;';
		const total = $(`.color-${PlayerColors[playerColorId]}`).length;
		let name = '??';
		for (let i = 0; i < data['players'].length; i++) {
			if (data['players'][i].color === playerColorId) {
				name = data['players'][i].user.username;
				break;
			}
		}
		$('#players').append(
			`<div style="${bold} color: ${PlayerColors[playerColorId]}">${name}: ${total}</div>`
		);
	}
}

function getClass(item, prop) {
	for (const cls of item.attr('class').split(/\s+/)) {
		if (cls.startsWith(`${prop}-`)) return cls.split('-').slice(1);
	}
}

function resetDraggable(draggable) {
	draggable.detach();
	$('#unit').append(draggable);
	// could move it slowly here
	draggable.css({top: _dragStartPosition.top, left: _dragStartPosition.left});
}

function drop(draggable, droppable, board, playerColorId, playerColor, currentRegion) {
	// get necessary stuff from drop location and drag unit
	var dragUnit = getClass(draggable, 'unit');
	const dropUnit = getClass(droppable, 'unit');
	const dropColor = getClass(droppable, 'color');
	const dropPos = $(droppable).attr('id').split('-');

	console.log(dropPos, dragUnit, dropUnit, playerColor, dropColor);

	board.updatePosition(dropPos[1], dropPos[2], playerColorId, dragUnit);

	post(`${window.location.pathname}/validate`,  // /game/<id>
		{ 'token': _accessToken, 'board': board, 'player_color_id': playerColorId, 'moves': ['test'] },
		function(data) {
			// TODO fix this
			draggable.remove();
			droppable.css('background-image', `url("../img/ground.png"), url("../img/${dragUnit}.png")`);
			droppable.addClass([currentRegion], `unit-${dragUnit}`);

			console.log(data);
		}
	);
}

function setupButtons(isPlayersTurn) {
	if (isPlayersTurn) {
		$('#buttonReset').click(function() {
			window.location.reload();
		});
		$('#buttonEndTurn').click(function() {
			// TODO: confirm and alert are being removed from browsers?
			if (confirm('Are you sure you want to end the turn?')) {
				alert('Turn ended!');
			}
		});
	}
	else {
		$('#buttonReset').button({ disabled: true });
		$('#buttonEndTurn').button({ disabled: true });
	}
}
