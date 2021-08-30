
dragStartPosition = null;


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
			// get important data from response
			const board = new Board(data.board.board);
			for (const player of data.players) {
				if (player.user.username == displayName) {
					playerColor = PlayerColorsEnum[player.color];
					playerColorId = player.color;
				}
			}

			// setup UI elements
			board.drawBoard(data, playerColorId, '#tiles');
			setupPlayerStats(data);
			if (data.current_turn_color == playerColorId) {
				setupButtons();
				setupHighlightRegion(data.regions, playerColorId);
			}
		},
		error: function(data) {
			console.log(data);
		}
	});
}

function setupHighlightRegion(regions, playerColorId) {
	$(document).on('click touchstart', '.hex', function() {
		setupDroppable(playerColor);

		$(`[class*=region][class*=white]`).each(function() {
			$(this).removeClass('color-white').addClass(`color-${playerColor}`);
			//$('#unit').html('');
		});

		if ($(this).attr('class').includes(`color-${playerColor}`)) {
			for (const c of $(this).attr('class').split(/\s+/)) {
				if (c.startsWith('region')) {
					$(`.${c}`).each(function() {
						$(this).removeClass(`color-${playerColor}`).addClass('color-white');
					});
					const s = c.split('-');
					const row = s[1];
					const col = s[2];
					region = regions[playerColorId][`(${row}, ${col})`]
					$('#savings').html(`Savings: ${region['savings']}`);
					$('#income').html(`Income: ${region['income']}`);
					$('#wages').html(`Wages: ${region['wages']}`);
					$('#balance').html(`Balance: ${region['balance']}`);
					$('#money').html(`Money: 0`);
					$('#unit').html('<div class="hex unit-man draggable unit"></div>');
					setupDraggable();
				}
			}
		}
	});
}

function setupDraggable() {
	$('.draggable').draggable({
		revert: 'invalid',
		start: function(event, ui) {
			dragStartPosition = ui.helper.position();
		}
	});
}

function setupDroppable(playerColor) {
	$(`.color-${playerColor}`).each(function() {
		$(this).addClass('droppable');
	});

	$('.droppable').droppable({
		accept: '.draggable',
		drop: function(event, ui) {
			const draggable = $(ui.draggable[0]);
			const droppable = $(this);
			drop(draggable, droppable, playerColor);
		}
	});
}

function setupPlayerStats(data) {
	for (const player of data.players) {
		const total = data.regions[player.color]['total'];
		$('#players').append(
			`<div style="color: ${PlayerColorsEnum[player.color]}">${player.user.username}: ${total}</div>`
		);
	}
}

function getClass(item, prop) {
	for (const cls of item.attr('class').split(/\s+/)) {
		if (cls.startsWith(`${prop}-`)) return cls.split('-')[1];
	}
}

function getUnitStrength(unit) {
	for (const [key, value] of Object.entries(UnitEnum)) {
		if (value == unit) return parseInt(key);
	}
}

function resetDraggable(draggable) {
	draggable.detach();
	$('#unit').append(draggable);
	draggable.css({top: dragStartPosition.top, left: dragStartPosition.left});
}

function drop(draggable, droppable, playerColor) {
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
			dragUnit = UnitEnum[totalStrength];
			droppable.removeClass(`unit-${dropUnit}`);
		}

		draggable.remove();
		droppable.addClass(`unit-${dragUnit}`);
	}
	else {
		console.log('on enemy territory');
		// win battle
		if (dragUnitStrength > dragUnitStrength) {
			draggable.remove();
			droppable.removeClass([`color-${playerColor}`, `unit-${dragUnit}`]);
			droppable.addClass([`color-${playerColor}`, `unit-${dragUnit}`]);
		}
		// can't battle - reset position
		else {
			resetDraggable(draggable);
		}
	}
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
