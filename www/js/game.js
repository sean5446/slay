
var dragStartPosition = null;

function initGame(displayName, email) {
	if (window.innerWidth > 1000) {
		$('#map').removeClass('vertical-map').addClass('horizontal-map');
		$('#panel').removeClass('vertical-panel').addClass('horizontal-panel');
	}

	$.ajax({
		type: 'POST',
		dataType: 'json',
		url: `${window.location.pathname}`,  // /game/<id>
		success: function(data) {
			for (const player of data.players) {
				if (player.user.username == displayName) {
					const board = new Board(data.board.board);
					const playerColor = PlayerColors[player.color];
					const playerColorId = player.color;

					// setup UI elements
					board.drawBoard(data, playerColorId, '#tiles');
					setupPlayerStats(data);
					if (data.current_turn_color == playerColorId) {
						setupButtons();
						setupHighlightRegion(data.regions, board, playerColorId, playerColor);
					}
					return;
				}
			}
		},
		error: function(data) {
			console.log(data);
		}
	});
}

function setupHighlightRegion(regions, board, playerColorId, playerColor) {
	$(document).on('click touchstart', '.hex', function() {
		// remove all white hex
		$('[class*=region][class*=white]').each(function() {
			$(this).removeClass('color-white').addClass(`color-${playerColor}`);
		});

		// add white hex to selected region
		if ($(this).attr('class').includes(`color-${playerColor}`)) {
			const currentRegion = 'region-' + getClass($(this), 'region').join('-');
			setupDroppable(board, playerColor, currentRegion);
			const c = getClass($(this), 'region');
			if (c !== undefined) {
				$(`.region-${c[0]}-${c[1]}`).each(function() {
					$(this).removeClass(`color-${playerColor}`).addClass('color-white');
				});
				const region = regions[playerColorId][`(${c[0]}, ${c[1]})`];
				updateRegionStats(region['savings'], region['income'], region['wages'], region['balance']);
				$('#unit').html('<div class="hex unit-man draggable unit"></div>');
				setupDraggable();
			}
		}
		else if ($(this).attr('class').match(/color-*/)) {
			updateRegionStats('', '', '', '');
			$('#unit').html('<div></div>');
		}
	});
}

function updateRegionStats(savings, income, wages, balance) {
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
			dragStartPosition = ui.helper.position();
		}
	});
}

function setupDroppable(board, playerColor, currentRegion) {
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
			drop(draggable, droppable, board, playerColor, currentRegion);
		}
	});
}

function setupPlayerStats(data) {
	for (const player of data.players) {
		const total = data.regions[player.color]['total'];
		$('#players').append(
			`<div style="color: ${PlayerColors[player.color]}">${player.user.username}: ${total}</div>`
		);
	}
}

function getClass(item, prop) {
	for (const cls of item.attr('class').split(/\s+/)) {
		if (cls.startsWith(`${prop}-`)) return cls.split('-').slice(1);
	}
}

function getUnitStrength(unit) {
	if (unit === undefined) return 0;
	for (const [k, v] of Object.entries(UnitValue)) {
		if (v == unit) return parseInt(k);
	}
}

function resetDraggable(draggable) {
	draggable.detach();
	$('#unit').append(draggable);
	draggable.css({top: dragStartPosition.top, left: dragStartPosition.left});
}

function drop(draggable, droppable, board, playerColor, currentRegion) {
	// position unit
	draggable.detach();
	$('#map').append(draggable);
	const posTop = Math.round(droppable.position().top + (droppable.height() / 2) - (draggable.height() / 2));
	const posLeft = Math.round(droppable.position().left + (droppable.width() / 2) - (draggable.width() / 2));
	draggable.css({position: 'absolute', top: posTop, left: posLeft});

	var dragUnit = getClass(draggable, 'unit');
	const dropUnit = getClass(droppable, 'unit');
	const dropColor = getClass(droppable, 'color');
	const dragUnitStrength = getUnitStrength(dragUnit);
	const dropUnitStrength = getUnitStrength(dropUnit);

	console.log(dragUnit, dropUnit, playerColor, dropColor, dragUnitStrength, dropUnitStrength);

	if (playerColor == dropColor || dropColor == 'white') {
		console.log('on friendly territory');

		if (dropUnit == 'baron' || dropUnit == 'hut' || dropUnit == 'castle') {
			resetDraggable(draggable);
			return;
		}
		if (dropUnit == 'tree') {
			droppable.removeClass(`unit-tree`);
		}

		// looking to level up
		if (dropUnitStrength > 2) {
			var totalStrength = dragUnitStrength + dropUnitStrength;
			if (totalStrength < 10) totalStrength = '0' + totalStrength.toString();
			dragUnit = UnitValue[totalStrength];
			droppable.removeClass(`unit-${dropUnit}`);
		}

		draggable.remove();
		droppable.addClass(`unit-${dragUnit}`);
	}
	else {
		console.log('on enemy territory');
		// win battle
		if (dragUnitStrength > dropUnitStrength) {
			draggable.remove();
			droppable.removeClass([`color-${dropColor}`, `unit-${dropUnit}`]);
			droppable.addClass([`color-${playerColor}`, `unit-${dragUnit}`, currentRegion]);
			setupDroppable(board, playerColor, currentRegion);
		}
		// can't win battle - reset position
		else {
			resetDraggable(draggable);
		}
	}

	// calculate cost of drop
}

function setupButtons() {
	$('#buttonReset').click(function() {
		window.location.reload();
	});
	$('#buttonEndTurn').click(function() {
		if (confirm('Are you sure you want to end the turn?')) {
			alert('Turn ended!');
		}
	});
}
