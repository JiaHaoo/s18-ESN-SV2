function show_searched_user(keyword) {
    //get searched user list
    query = 'query=' + keyword;
    params = [query];
    $.get('/v1/users/users?' + params.join('&'))
        .done(function (res) {
            // res = {online: [users], offline: [users]}
            show_user_list(res);
        });
}

function show_user_list(data) {
    var html_text = "";
    data.online.forEach(function (user) {
        html_text += make_userlist_item(user, true);
    });
    data.offline.forEach(function (user) {
       html_text += make_userlist_item(user, false);
    });
    $('#online-userlist').html(html_text);
}

$('document').ready(function () {
    var current_messages = [];
    var socket = io();

    // userpair[0] -> username, userpair[1] -> status
    socket.on('userlist_update', function (data) {
        show_user_list(data);
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

});


