
$(document).ready(function () {

	if (getCookie('user') === null) {
		//email = prompt('Enter email');
		//password = prompt('Enter password');
		// TODO: validate password
		// throw new Error("Wrong password!");
		// setCookie('user', email, 30);
	}

	getUserList();
	getGamesList();

	$('#buttonNewGame').click(function() {
		getNewGame();
	});

	$('#buttonJoinGame').click(function () {
		alert('join game pressed!')
	});

});

function getUserList() {
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "/user",
		success: function (data) {
			users = data;
			source = [];
			for (var i = 0; i < users.length; i++) {
				var entry = users[i].username + ' (' + users[i].score + ')'
				source.push(entry);
			}
			$("#listboxUsers").jqxListBox({ width: 300, source: source, checkboxes: true, height: 300 });
			//$("#listboxUsers").on('checkChange', function (event) {
			//	var args = event.args;
			//	if (args.checked) {
			//});
		},
		error: function (data) {
			// error
		}
	});
}

function getGamesList() {
	source = [];
	$("#listboxGames").jqxListBox({ width: 300, source: source, checkboxes: true, height: 300 });
}

function getNewGame() {
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

	$.ajax({
		url: "/game/create",
		type: "POST",
		contentType: 'application/json',
		data: JSON.stringify(checkedItems),
		success: function (data) {
			// document.write(data.responseText);
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
