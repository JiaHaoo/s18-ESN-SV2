function show_searched_user(keyword) {
    //get searched user list
    query = 'query=' + keyword;
    params = [query];
    $.get('/v1/users?' + params.join('&'))
        .done(function (res) {
            // res = {online: [users], offline: [users]}
            show_user_list(res);
        });
}

function show_user_list(data) {
    var html_text = "";
    console.log(privilege);
    data.online.forEach(function (user) {
        html_text += make_userlist_item(user, true, privilege);
    });
    data.offline.forEach(function (user) {
       html_text += make_userlist_item(user, false, privilege);
    });
    $('#online-userlist').html(html_text);
}

$('document').ready(function () {
    

    var current_messages = [];
    var socket = io();

    // userpair[0] -> username, userpair[1] -> status
    socket.on('userlist_update', function (data) {
        show_user_list(data);

        $('.edit-profile-btn').click(function(){
            console.log('edit profile button...');
            console.log($(this).attr('id'));
            $('#administrator_edit_profile').modal('show');
            $('#edit_username').val($(this).attr('id'));
        });
    });

    //close before webpage quit
    window.onbeforeunload = function () {
        socket.close()
    };



    $('#card-title').click(function () {
        $('#online-userlist').toggle();
    });

    $('#navbar_search_form').on('submit', function (event) {
        event.preventDefault();
        var text = $('#navbar_search_form').find('input').val();
        if (text)
            show_searched_user(text);

    });

    $('#save_edit_profile').click(function(){
        $('#administrator_edit_profile').modal('hide');
    });

    $('#asdd li > a').click(function(e){
        console.log('account status click');
        $('.status').text($(this).text());
    });

    $('#pdd li').on('click', function(){
        console.log('privilege level click');
        $('.Pstatus').text($(this).text());
    });

    $('#save_edit_profile').click(function(){
        $.ajax({
    		type: 'PUT',
    		url: '/v1/users/'+ userrrrrrr,
    		data: {username: $('#edit_username').val(), password: $('#edit_password').val(), account_status: $('.status').text(), privilege_level: $('.Pstatus').text()},
    		success: function(res) {
    			$('#administrator_edit_profile').modal('hide');
            }
        });
    });

});


