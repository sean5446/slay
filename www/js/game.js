
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
			const regions = data.regions;
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
				setupHighlightRegion(regions, playerColorId);
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
					var row = c.split('-')[1];
					var col = c.split('-')[2];
					region = regions[playerColorId][`(${row}, ${col})`]
					$('#savings').html(`Savings: ${region['savings']}`);
					$('#income').html(`Income: ${region['income']}`);
					$('#wages').html(`Wages: ${region['wages']}`);
					$('#balance').html(`Balance: ${region['balance']}`);
					$('#money').html(`Money: 0`);
					$('#unit').html('<div class="hex unit-man draggable unit"></div>');
					setupDraggable(regions);
				}
			}
		}
	});
}

function setupDraggable(regions) {
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
			draggable = $(ui.draggable[0])
			droppable = $(this)
			drop(draggable, droppable, playerColor);
		}
	});
}

function setupPlayerStats(data) {
	for (const player of data.players) {
		var total = data.regions[player.color]['total'];
		$('#players').append(
			`<div style="color: ${PlayerColorsEnum[player.color]}">${player.user.username}: ${total}</div>`
		);
	}
}

function unitsAtPosition(item) {
	return $("#map").find('.unit').filter(function() {
		var e = $(this);
		if (e.offset().top == item.offset().top && e.offset().left == item.offset().left) return e;
	});
}

function getClass(item, prop) {
	for (cls of item.attr('class').split(/\s+/)) {
		if (cls.startsWith(`${prop}-`)) return cls.split('-')[1];
	}
}

function getUnitStrength(unit) {
	for (const [key, value] of Object.entries(UnitEnum)) {
		if (value == unit) return parseInt(key);
	}
}

function resetDraggable() {
	draggable.detach();
	$('#unit').append(draggable);
	draggable.css({top: dragStartPosition.top, left: dragStartPosition.left});
}

function drop(draggable, droppable, playerColor) {
	// position unit
	draggable.detach();
	$('#map').append(draggable);
	pos_top = Math.round(droppable.position().top + (droppable.height() / 2) - (draggable.height() / 2));
	pos_left = Math.round(droppable.position().left + (droppable.width() / 2) - (draggable.width() / 2));
	draggable.css({position: 'absolute', top: pos_top, left: pos_left});

	const dragUnit = getClass(draggable, 'unit');
	const hexUnit = getClass($(unitsAtPosition(draggable)[0]), 'unit'); // not sure why this has to be draggable
	const hexColor = getClass(droppable, 'color');
	const dragUnitStrength = getUnitStrength(dragUnit);
	const hexUnitStrength = getUnitStrength(hexUnit);

	if (playerColor == hexColor || hexColor == 'white' && hexUnit) {
		console.log('on friendly territory');

		if (hexUnit == 'baron') resetDraggable();

		// looking to level up
		var units = unitsAtPosition(draggable);
		if (units.length > 1) {
			var totalStrength = 0;
			for (i = 0; i < units.length; i++) {
				const unit = getClass($(units[i]), 'unit');
				totalStrength += getUnitStrength(unit);
				$(units[i]).remove();
			}
			if (totalStrength < 10) totalStrength = '0' + totalStrength.toString();
			const upgradedUnit = UnitEnum[totalStrength];
			const elementUnit = $(`<div class="hex unit-${upgradedUnit} draggable unit" style="top: ${pos_top}px; left: ${pos_left}px;"></div>`);
			$('#map').append(elementUnit);
			setupDraggable();
			elementUnit.draggable();
		}
	}
	else {
		console.log('on enemy territory');
		// win battle
		if (dragUnitStrength > hexUnitStrength) {
			draggable.remove();
			droppable.removeClass([hexColor, hexUnit]);
			droppable.addClass([`color-${playerColor}`, dragUnit]);
		}
		// can't battle - reset position
		else {
			resetDraggable();
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
