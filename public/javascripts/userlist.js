var un = "";
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

    var userlist_update_event;
    if (privilege === 'Administrator') {
        userlist_update_event = 'all_userlist_update';
    } else {
        userlist_update_event = 'userlist_update';
    }

    // userpair[0] -> username, userpair[1] -> status
    socket.on(userlist_update_event, function (data) {
        show_user_list(data);

        $('.edit-profile-btn').click(function () {
            $('#administrator_edit_profile').modal('show');
            $('#edit_username').val($(this).attr('id'));
            un = $(this).attr('id');
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

    $('#save_edit_profile').click(function () {
        $('#administrator_edit_profile').modal('hide');
    });

    $('#asdd li > a').click(function (e) {
        $('.status').text($(this).text());
    });

    $('#pdd li').on('click', function () {
        $('.Pstatus').text($(this).text());
    });

    $('#save_edit_profile').click(function () {
        var ddata = {};
        ddata['username'] = $('#edit_username').val();
        console.log('edit this user profile', un);
        if ($('#edit_password').val() !== '') {
            ddata['password'] = md5($('#edit_password').val());
        }
        if ($('.status').text() !== "Account Status") {
            ddata['accountStatus'] = $('.status').text();
        }
        if ($('.Pstatus').text() !== "Privilege Level") {
            ddata['privilegeLevel'] = $('.Pstatus').text();
        }
        console.log(ddata);
        $.ajax({
            type: 'PUT',
            url: '/v1/users/' + un,
            data: ddata,
            success: function (res) {
                $('#administrator_edit_profile').modal('hide');
            }
        });
    });
});


