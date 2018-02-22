$(document).ready(function() {
    $('#signin-btn').click(function() {
    	var un = $('#username-input').val();
    	var ps = md5($('#password-input').val());
    	// check the correctness of username

        login(un, ps);
    }); 

    $('#register-btn').click(function() {
		var un = $('#username-input').val();
    	var ps = md5($('#password-input').val());
    	console.log('zhuce:' + ps);

    	$.ajax({
    		type: 'PUT',
    		url: '/v1/users/'+un,
    		data: {password: ps},
    		success: function(res) {
    			login(un, ps, true);
    		}
    	});
    });

    $("#close-alert").click(function(){
        $("#wrong-passwd-alert").hide();
    });
});


function login(username, password, newFlag) {
	console.log('denglu:' + password);
	$.ajax({
		type: 'POST',
		url: '/v1/users',
		data: {username: username, password: password},
		success: function(res) {
			window.location.href = res['redirect'] + '?newMember=' + (newFlag ? 'true' : 'false');
		}
	}).fail(function($xhr) {
		var data = $xhr.responseJSON;
    	if (data['name'] === 'IncorrectPasswordError') {
            $('#password-input').val('');
            $('#wrong-passwd-alert').show();
    	} else if(data['name'] === 'IncorrectUsernameError') {
    		$('#register-modal').modal({show: true});
    	}
	})
}
