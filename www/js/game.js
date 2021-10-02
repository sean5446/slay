
var dragStartPosition = null;

function initGame(displayName, email) {
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
					
					// setup UI elements - 95 in height comes from .hex size
					if (window.innerWidth > 1000) {
						$('#map').removeClass('vertical-map').addClass('horizontal-map').height(board.numRows * 95);
						$('#panel').removeClass('vertical-panel').addClass('horizontal-panel');
					}
					board.drawBoard(playerColorId, '#tiles');
					setupPlayerStats(data, board);
					if (data.current_turn_color == playerColorId) {
						setupButtons();
						setupClickTouch(board, playerColorId, playerColor);
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

function setupClickTouch(board, playerColorId, playerColor) {
	// mousedown touchstart are alternatives
	$(document).on('click touch', '.hex', function() {
		// remove all white hex (unselect)
		$('[class*=region][class*=white]').each(function() {
			$(this).removeClass('color-white').addClass(`color-${playerColor}`);
		});

		// selected friendly tile
		if ($(this).attr('class').includes(`color-${playerColor}`)) {
			const regions = recolorRegions(board, playerColorId);
			// if a region, set droppable
			var currentRegion = getClass($(this), 'region');
			if (currentRegion == undefined) return;  // solo square has no region
			const c = currentRegion;
			currentRegion = 'region-' + currentRegion.join('-');
			console.log(`currentRegion: ${currentRegion}`);
			setupDroppable(board, playerColorId, playerColor, currentRegion);

			// color white (selected)
			$(`.${currentRegion}`).each(function() {
				$(this).removeClass(`color-${playerColor}`).addClass('color-white');
			});
			// const region = regions[`${c[0]},${c[1]}`];
			// updateRegionStats(region['savings'], region['income'], region['wages'], region['balance']);

			// allow user to drag a unit
			$('#unit').html('<div class="unit-man draggable"></div>');
			setupDraggable();
		}
		// selected enemy tile
		else if ($(this).attr('class').match(/color-*/)) {
			updateRegionStats('', '', '', '');
			$('#unit').html('<div></div>');
		}
	});
}

function recolorRegions(board, playerColorId) {
	// remove all regioned tiles
	$('[class*=region]').each(function() {
		const r = getClass($(this), 'region');
		console.log(`removing: region-${r[0]}-${r[1]} ${$(this).attr('id')}`);
	});
	// reapply regions
	const regions = board.getRegions(playerColorId);
	for (const [k, v] of Object.entries(regions)) {
		for (const t of v) {
			const pos = k.split(',');
			$(`#tile-${t[0]}-${t[1]}`).addClass(`region-${pos[0]}-${pos[1]}`);
		}
	}
	return regions;
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

function setupPlayerStats(data, board) {
	for (const player of data.players) {
		const regions = board.getRegions(player.color);
		var total = 0;
		for (const [k, v] of Object.entries(regions)) total += v.length;
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
	for (const [k, v] of Object.entries(UnitValues)) {
		if (v == unit) return parseInt(k);
	}
}

function resetDraggable(draggable) {
	draggable.detach();
	$('#unit').append(draggable);
	// could move it slowly here
	draggable.css({top: dragStartPosition.top, left: dragStartPosition.left});
}

function drop(draggable, droppable, board, playerColorId, playerColor, currentRegion) {
	// get necessary stuff from drop location and drag unit
	var dragUnit = getClass(draggable, 'unit');
	var dragUnitStrength = getUnitStrength(dragUnit);
	const dropUnit = getClass(droppable, 'unit');
	const dropUnitStrength = getUnitStrength(dropUnit);
	const dropColor = getClass(droppable, 'color');
	const dropPos = $(droppable).attr('id').split('-');

	console.log(dropPos, dragUnit, dropUnit, playerColor, dropColor, dragUnitStrength, dropUnitStrength);

	// friendly region
	if (playerColor == dropColor || dropColor == 'white') {
		if (dropUnit == 'baron' || dropUnit == 'hut' || dropUnit == 'castle') {
			resetDraggable(draggable);
			return;
		}
		if (dropUnit == 'tree') {
			droppable.removeClass('unit-tree');
		}
		// looking to level up
		if (dropUnitStrength > 2) {
			var totalStrength = dragUnitStrength + dropUnitStrength;
			if (totalStrength < 10) totalStrength = '0' + totalStrength.toString();
			dragUnitStrength = totalStrength;
			dragUnit = UnitValues[dragUnitStrength];
			droppable.removeClass(`unit-${dropUnit}`);
		}
		draggable.remove();
		// droppable.css('background-image', `url("../img/ground.png"), url("../img/${dragUnit}.png")`);
		droppable.addClass([currentRegion], `unit-${dragUnit}`);
		board.updatePosition(dropPos[1], dropPos[2], playerColorId, dragUnitStrength);
	}
	else {
		// enemy tile
		for (const n of board.getNeighbors(dropPos[1], dropPos[2])) {
			// if dropColor == getClass 'color' n[0] n[1] 
			// const nUnit = getClass($(`#tile-${n[0]}-${n[1]}`), 'unit');
			// for (const u of nUnit) {
			// 	if (dragUnitStrength < getUnitStrength(nUnit)) resetDraggable(draggable);
			// }
		}
		if (dragUnitStrength > dropUnitStrength) {
			draggable.remove();
			droppable.removeClass([`color-${dropColor}`, `unit-${dropUnit}`]);
			// droppable.css('background-image', `url("../img/ground.png"), url("../img/${dragUnit}.png")`);
			droppable.addClass(['color-white', currentRegion, `unit-${dragUnit}`]);
			if (dragUnitStrength < 10) dragUnitStrength = '0' + dragUnitStrength.toString();
			board.updatePosition(dropPos[1], dropPos[2], playerColorId, dragUnitStrength);
		}
		else {
			// can't win battle - reset position
			resetDraggable(draggable);
		}
	}
}

function setupButtons() {
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
