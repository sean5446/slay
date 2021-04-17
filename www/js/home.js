function initMainMenu(displayName, email) {
	$('#firebaseui-auth-container').hide();
	$('#sign-in-status').html(`Logged in: ${displayName}`);

	$('#buttonNewGame').click(function() {
		createNewGame();
	});
	$('#buttonJoinGame').click(function () {
		alert('join game pressed!')
	});
	getUserList(displayName, email);
	getGamesList(displayName);
}

function initApp() {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// User is signed in
			user.getIdToken().then(function(accessToken) {
				initMainMenu(user.displayName, user.email);
			});
		} else {
			// User is signed out
			var uiConfig = {
				signInSuccessUrl: '/home.html',
				signInOptions: [
					firebase.auth.GoogleAuthProvider.PROVIDER_ID,
					firebase.auth.FacebookAuthProvider.PROVIDER_ID,
					firebase.auth.EmailAuthProvider.PROVIDER_ID,
				],
				tosUrl: '<your-tos-url>',
				privacyPolicyUrl: function() {
					window.location.assign('<your-privacy-policy-url>');
				}
			};
			var ui = new firebaseui.auth.AuthUI(firebase.auth());
			ui.start('#firebaseui-auth-container', uiConfig);
		}
	}, function(error) {
		console.log(error);
	});
};

function getUserList(displayName, email) {
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "/user",
		success: function(data) {
			var users = data;
			var source = [];
			var found = false;
			for (var i = 0; i < users.length; i++) {
				if (!users[i].username.localeCompare(displayName)) {
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
			$("#listboxUsers").jqxListBox({ width: 300, source: source, checkboxes: true, height: 300 });
		},
		error: function(data) {
			// error
		}
	});
}

function createUser(username, email) {
	$.ajax({
		url: "/user/create",
		type: "POST",
		contentType: 'application/json',
		data: JSON.stringify({ 'username': username, 'email': email } ),
		success: function(data) {
			console.log(data.responseText);
		},
		error: function(data) {
			console.log(data.responseText);
		}
	});
}

function getGamesList(user) {
	var source = [];
	$("#listboxGames").jqxListBox({ width: 300, source: source, checkboxes: true, height: 300 });
}

function createNewGame() {
	var items = $("#listboxUsers").jqxListBox('getCheckedItems');
	var checkedItems = [];
	$.each(items, function (index) {
		var user = this.label.match(/^(\w+)/);
		checkedItems.push(user[0]);
	});

	if (checkedItems.length <= 2) {
		alert('Must select at least 3 users!');
		return;
	}

	var name = prompt('Enter game name');
	if (name === null || name.length < 4) {
		alert('Enter a game name! (4+ characters)');
		return;
	}

	$.ajax({
		url: "/game/create",
		type: "POST",
		contentType: 'application/json',
		data: JSON.stringify({ 'name': name, 'users': checkedItems } ),
		success: function (data) {
			// document.write(data.responseText);  // writes head and body
			console.log(data.responseText);
		},
		error: function (data) {
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
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function removeCookie(name) {
	document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
