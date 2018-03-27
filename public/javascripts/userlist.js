$('document').ready(function () {
    var current_messages = [];
    var socket = io();

    // userpair[0] -> username, userpair[1] -> status
    socket.on('userlist_update', function (data) {
        var html_text = "";
        data.online.forEach(function (userpair) {
            html_text += make_userlist_item(userpair, true);
        });
        data.offline.forEach(function (userpair) {
            html_text += make_userlist_item(userpair, false);
        });
        $('#online-userlist').html(html_text);
    });

    //close before webpage quit
    window.onbeforeunload = function () {
        socket.close()
    };



    $('#card-title').click(function () {
        $('#online-userlist').toggle();
    });

});


