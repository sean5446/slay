
dragStartPosition = null;

function initGame(displayName, email) {
	if (window.innerWidth > 1000) {
		$('#map').removeClass('vertical-map').addClass('horizontal-map');
		$('#panel').removeClass('vertical-panel').addClass('horizontal-panel');
	}
	
	$.ajax({
		type: 'POST',
		dataType: 'json',
		url: `${window.location.pathname}`,
		success: function(data) {
			for (const player of data.players) {
				if (player.user.username == displayName) {
					playerColor = PlayerColorsEnum[player.color];
					playerColorId = player.color;
				}
			}
			board = new Board(data.board.board);
			regions = board.drawBoard('#tiles', playerColorId);

			setupHighlightRegion(playerColor, regions);
			setupPlayerStats(data, regions);
			setupDraggable(regions);
			setupDroppable(playerColor, regions);
			setupButtons();
		},
		error: function(data) {
			console.log(data);
		}
	});
}

function setupHighlightRegion(playerColor, regions) {
	$(document).on('click touchstart', '.hex', function() {
		$(`[class*=region][class*=white]`).each(function() {
			$(this).removeClass('color-white').addClass(`color-${playerColor}`);
			$('#unit').html('');
		});

		if ($(this).attr('class').includes(`color-${playerColor}`)) {
			for (const c of $(this).attr('class').split(/\s+/)) {
				if (c.startsWith('region')) {
					$(`.${c}`).each(function() {
						$(this).removeClass(`color-${playerColor}`).addClass('color-white');
					});
					var row = c.split('-')[1];
					var col = c.split('-')[2];
					region = regions[playerColorId][ [row,col] ];
					// TODO remove trees from income, find wages
					$('#savings').html(`Savings: 10`);
					$('#income').html(`Income: ${region.length}`);
					$('#wages').html(`Wages: 0`);
					$('#balance').html(`Balance: 0`);
					$('#money').html(`Money: 0`);
					$('#unit').html('<div class="hex unit-man draggable unit"></div>');
					setupDraggable(regions);
					setupDroppable(playerColor, regions);
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

function setupDroppable(playerColor, regions) {
	$(`.color-${playerColor}`).each(function() {
		$(this).addClass('droppable');
	});

	$('.droppable').droppable({
		accept: '.draggable',
		drop: function(event, ui) {
			draggable = $(ui.draggable[0])
			droppable = $(this)
			drop(draggable, droppable);
		}
	});
}

function setupPlayerStats(data, regions) {
	for (const player of data.players) {
		var total = 0;
		for (const [k, v] of Object.entries(regions[player.color])) {
			total += v.length;
		}
		$('#players').append(
			`<div style="color: ${PlayerColorsEnum[player.color]}">${player.user.username}: ${total}</div>`
		);
	}
}

function unitsAtPosition(top, left) {
	return $("#map").find('.unit').filter(function() {
		e = $(this)
		if (e.offset().top == top && e.offset().left == left) return e;
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

function drop(draggable, droppable) {
	draggable.detach();
	$('#map').append(draggable);
	var dragUnit = getClass(draggable, 'unit');
	var hexUnit = getClass(droppable, 'unit');
	var hexColor = getClass(droppable, 'color');
	var dragUnitStrength = getUnitStrength(dragUnit);
	var hexUnitStrength = getUnitStrength(hexUnit);

	if (playerColor == hexColor || hexColor == 'white') {
		console.log('on friendly territory');
		// position unit
		pos_top = Math.round(droppable.position().top + (droppable.height() / 2) - (draggable.height() / 2))
		pos_left = Math.round(droppable.position().left + (droppable.width() / 2) - (draggable.width() / 2))
		draggable.css({position: 'absolute', top: pos_top, left: pos_left});

		// looking to level up
		units = unitsAtPosition(draggable.offset().top, draggable.offset().left);
		if (units.length > 1) {
			var totalStrength = 0;
			for (i = 0; i < units.length; i++) {
				var unit = getClass($(units[i]), 'unit');
				totalStrength += getUnitStrength(unit);
				$(units[i]).remove();
			}
			if (totalStrength < 10) totalStrength = '0' + totalStrength.toString();
			var upgradedUnit = UnitEnum[totalStrength];
			var elementUnit = $(`<div class="hex unit-${upgradedUnit} draggable unit" style="top: ${pos_top}px; left: ${pos_left}px;"></div>`);
			$('#map').append(elementUnit);
			setupDraggable();
			elementUnit.draggable();
		}
		// just place the unit
		else {
			draggable.css({top: pos_top, left: pos_left});
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
			draggable.css({top: dragStartPosition.top, left: dragStartPosition.left});
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
