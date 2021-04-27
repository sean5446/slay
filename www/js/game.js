
dragStartPosition = null;
username = null;
playerColor = null;
playerColorId = null;
board = null;
regions = null;

function initGame(displayName, email) {
	username = displayName;

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
				if (player.user.username == username) {
					playerColor = PlayerColorsEnum[player.color];
					playerColorId = player.color;
				}
			}

			board = new Board(data.board.board);
			regions = board.drawBoard('#tiles', playerColorId);

			for (const player of data.players) {
				var total = 0;
				for (const [k, v] of Object.entries(regions[player.color])) {
					total += v.length;
				}
				$('#players').append(
					`<div style="color: ${PlayerColorsEnum[player.color]}">${player.user.username}: ${total}</div>`
				);
			}

			setupDroppable();
		},
		error: function(data) {
			console.log(data);
		}
	});

	$('#buttonReset').click(function() {
		//window.location.reload(true)
		location.reload();
	});

	$('#buttonEndTurn').click(function() {
		if (confirm('Are you sure you want to end the turn?')) {
			alert('Turn ended!');
		}
	});
}

function unitsAtPosition(top, left) {
	return $("#map").find('.unit').filter(function() {
		e = $(this)
		if (e.offset().top == top && e.offset().left == left) return e;
	});
}

function getColor(classes) {
	var color = classes.filter(function(n) {
		return PlayerColorsEnum.indexOf(n) !== -1;
	});
	return color;
}

function getUnit(classes) {
	var unit = classes.filter(function(n) {
		return UnitEnum[n];
	});
	return unit;
}

function getUnitFromStrength(strength) {
	for (const [key, value] of Object.entries(UnitEnum)) {
		if (value == strength) return key;
	}
}

function drop(draggable, droppable) {
	var dropClasses = droppable.attr('class').split(/\s+/);
	var dragClasses = draggable.attr('class').split(/\s+/);
	var dragUnit = getUnit(dragClasses)[0];
	var hexColor = getColor(dropClasses)[0];
	var hexUnit = getUnit(dropClasses)[0];
	var dragUnitStrength = UnitEnum[dragUnit];
	var hexUnitStrength = UnitEnum[hexUnit];

	if (playerColor == hexColor) {
		console.log('on friendly territory');
		// position unit
		pos_top = Math.round(droppable.position().top + (droppable.height() / 2) - (draggable.height() / 2))
		pos_left = Math.round(droppable.position().left + (droppable.width() / 2) - (draggable.width() / 2))
		draggable.css({top: pos_top, left: pos_left});

		// looking to level up
		units = unitsAtPosition(draggable.offset().top, draggable.offset().left);
		if (units.length > 1) {
			var totalStrength = 0;
			for (i = 0; i < units.length; i++) {
				var e = $(units[i]);
				var unit = getUnit(e.attr('class').split(/\s+/));
				totalStrength += UnitEnum[unit];
				e.remove();
			}
			var upgradedUnit = getUnitFromStrength(totalStrength);
			var elementUnit = $(`<div class="hex ${upgradedUnit} draggable unit" style="top: ${pos_top}px; left: ${pos_left}px;"></div>`);
			$('#map').append(elementUnit);
			setDraggable();
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
			droppable.addClass([playerColor, dragUnit]);
		}
		// can't battle - reset position
		else {
			draggable.css({top: dragStartPosition.top, left: dragStartPosition.left});
		}
	}
}

function setDraggable() {
	$('.draggable').draggable({
		revert: 'invalid',
		start: function(event, ui) {
			dragStartPosition = ui.helper.position();
		}
	});
}

function setupDroppable() {
	$(`.${playerColor}`).each(function() {
		$(this).addClass('droppable');
	});

	setDraggable();

	$('.droppable').droppable({
		accept: '.draggable',
		drop: function(event, ui) {
			draggable = $(ui.draggable[0])
			droppable = $(this)
			drop(draggable, droppable);
		}
	});

	$(document).on('click touchstart', '.hex', function() {
		$(`[class*=region][class*=white]`).each(function() {
			$(this).removeClass('white').addClass(playerColor);
		});

		if ($(this).attr('class').includes(playerColor)) {
			for (const c of $(this).attr('class').split(/\s+/)) {
				if (c.startsWith('region')) {
					$(`.${c}`).each(function() {
						$(this).removeClass(playerColor).addClass('white');
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
				}
			}
		}
	});
}

