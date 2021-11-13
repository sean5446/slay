
$(document).ready(function() {
	$('#main-menu').hide();
	$.ajax({
		type: "GET",
		dataType: "json",
		url: `/firebase`,
		success: function(data) {
			firebaseInit(data);
		},
		error: function(data) {
			console.log(data);
		}
	});
});

function firebaseInit(data) {
	firebase.initializeApp(data);
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// user is signed in
			user.getIdToken().then(function(accessToken) {
				initMainMenu(user.displayName, user.email, accessToken);
			});
		} else {
			// user is signed out
			let uiConfig = {
				signInSuccessUrl: '/home.html',
				signInOptions: [
					firebase.auth.GoogleAuthProvider.PROVIDER_ID,
					firebase.auth.EmailAuthProvider.PROVIDER_ID,
				],
				tosUrl: '<your-tos-url>',
				privacyPolicyUrl: function() {
					window.location.assign('<your-privacy-policy-url>');
				}
			};

			let ui = new firebaseui.auth.AuthUI(firebase.auth());
			ui.start('#firebaseui-auth-container', uiConfig);
		}
	}, function(error) {
		console.log(error);
	});
}

function initMainMenu(displayName, email, accessToken) {
	$('#firebaseui-auth-container').hide();
	$('#main-menu').show();
	$('#sign-in-status').html(`Logged in: ${displayName}`);
	$('#button-create-game').click(function() {
		createGame(displayName, accessToken);
	});
	getUserList(displayName, email, accessToken);
	getGameList(displayName, accessToken);
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

function getUserList(displayName, email, accessToken) {
	post("/user",
		{ "token": accessToken },
		function(data) {
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
				createUser(displayName, email, accessToken);
			}
			$("#listbox-users").jqxListBox({ width: $(window).width()/2-10, source: source, checkboxes: true, height: 300 });
		}
	);
}

function createUser(username, email, accessToken) {
	post("/user/create",
		{ "token": accessToken, 'username': username, 'email': email },
		function(data) {
			console.log(data.responseText);
		}
	);
}

function getGameList(user, accessToken) {
	post(`/user/${user}`,
		{ "token": accessToken },
		function(data) {
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
		}
	);
	var source = [];
	$("#listbox-games").jqxListBox({ width: $(window).width()/2-10, source: source, checkboxes: true, height: 300 });
}

function reverse(s) {
    return s.split("").reverse().join("");
}

function createGame(displayName, accessToken) {
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

	post("/game/create",
		{ "token": accessToken, 'name': name, 'users': checkedItems },
		function(data) {
			window.location.assign('/game/' + data.current_board_id);
		}
	);
}

function setCookie(name, value, days) {
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
