$(document).ready(function() {
    $('#signin-btn').click(function() {
    	var un = $('#username-input').val();
    	var ps = $('#password-input').val();
    	// check the correctness of username

        $.ajax({
        	type: 'POST',
        	url: '/v1/users',
        	data: {username: un, password: ps},
        	success: function(res) {
        		window.location.href = res['redirect'];
        	}
        }).fail(function($xhr) {
        	var data = $xhr.responseJSON;
        	if (data['name'] === 'IncorrectPasswordError') {

        	} else if(data['name'] === 'IncorrectUsernameError') {
        		$('#register-modal').modal({show: true});
        		console.log('hi');
        	}
        });
    }); 

    $('#register-btn').click(function() {
		var un = $('#username-input').val();
    	var ps = $('#password-input').val();

    	$.ajax({
    		type: 'PUT',
    		url: '/v1/users/'+un,
    		data: {password: ps},
    		success: function(res) {
    			window.location.href = res['redirect'];
    		}
    	});
    });
});