
function initMainMenu(displayName, email) {
	$('#firebaseui-auth-container').hide();
	$('#main-menu').show();
	$('#sign-in-status').html(`Logged in: ${displayName}`);
	$('#button-create-game').click(function() {
		createGame(displayName);
	});
	getUserList(displayName, email);
	getGameList(displayName);
}

function getUserList(displayName, email) {
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "/user",
		success: function(data) {
			const users = data;
			var source = [];
			var found = false;
			for (var i = 0; i < users.length; i++) {
				if (users[i].username === displayName) {
					found = true;
				}
				else {
					var entry = users[i].username + ' (' + users[i].score + ')';
					source.push(entry);
				}
			}
			if (!found) {
				createUser(displayName, email);
			}
			$("#listbox-users").jqxListBox({ width: $(window).width()/2-10, source: source, checkboxes: true, height: 300 });
		},
		error: function(data) {
			console.log(data);
		}
	});
}

function createUser(username, email) {
	$.ajax({
		url: "/user/create",
		type: "POST",
		dataType: "json",
		contentType: 'application/json; charset=utf-8',
		data: JSON.stringify({ 'username': username, 'email': email } ),
		success: function(data) {
			console.log(data.responseText);
		},
		error: function(data) {
			console.log(data.responseText);
		}
	});
}

function getGameList(user) {
	$.ajax({
		type: "GET",
		dataType: "json",
		url: `/user/${user}`,
		success: function(data) {
			const games = data.games;
			var source = [];
			for (const [key, value] of Object.entries(games)) {
				var entry = `${key}: ${value}`
				source.push(entry);
			}
			$("#listbox-games").jqxListBox({ width: $(window).width()/2-10, source: source, checkboxes: true, height: 300 });
			$("#listbox-games").on('checkChange', function(event) {
				var id = event.args.item.label.match(/^(\d+)/)[0].trim();
				window.location.assign('/game/' + id);
			});
		},
		error: function(data) {
			console.log(data);
		}
	});

	var source = [];
	$("#listbox-games").jqxListBox({ width: $(window).width()/2-10, source: source, checkboxes: true, height: 300 });
}

function reverse(s) {
    return s.split("").reverse().join("");
}

function createGame(displayName) {
	const items = $("#listbox-users").jqxListBox('getCheckedItems');
	var checkedItems = [displayName];
	$.each(items, function(index) {
		const user = reverse(reverse(this.label).match(/^\)\d+\( (.+)$/)[1]).trim(); // remove score
		checkedItems.push(user);
	});

	if (checkedItems.length < 2 || checkedItems.length > 5) {
		alert('Must select at 2-4 users!');
		return;
	}

	var name = prompt('Enter game name');
	if (name === null || name.length < 4 || name.length > 64) {
		alert('Enter a game name! (4-64 characters)');
		return;
	}

	$.ajax({
		url: "/game/create",
		type: "POST",
		dataType: "json",
		contentType: 'application/json; charset=utf-8',
		data: JSON.stringify({ 'name': name, 'users': checkedItems } ),
		success: function(data) {
			window.location.assign('/game/' + data.current_board_id);
		},
		error: function(data) {
			console.log(data.responseText);
		}
	});
}

function setCookie(name,value,days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
	const nameEQ = name + "=";
	const ca = document.cookie.split(';');
	for(var i=0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

function removeCookie(name) {
	document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
