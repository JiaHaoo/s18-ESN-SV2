$('document').ready(function () {
    var current_messages = [];
    var socket = io();
    socket.on('connect', function (evt) {
        console.log('Connection open ...');
        $('#online-users-list').hide();
        $.get("/v1/rooms/" + room_id + "/messages", { sort: "+timestamp" }, function (data) {
            concatenate_message(current_messages, data);
        }, 'json');
    });

    // userpair[0] -> username, userpair[1] -> status
    socket.on('userlist_update', function (data) {
        var html_text = "";
        data.online.forEach(function (user) {
            html_text += make_userlist_item(user, true);
        });
        data.offline.forEach(function (user) {
            html_text += make_userlist_item(user, false);
        });
        $('#online-users-list').html(html_text);
    });

    socket.on('show_messages', function (data) {
        data
            .filter(function (m) {
                return m.room !== room_id && m.room !== '000000000000000000000000';
            })
            .map(function (m) { return m.sender.username; })
            .forEach(highlight_userlist_item);

        data = data.filter(function (msg) {
            return msg.room === room_id;
        });
        concatenate_message(current_messages, data);
    });

    socket.on('show_announcement', function (announcement) {
        //1. make modal
        //2. make alert
        //  on click: show modal
        $('#announcement_modal_body').html(
            make_announcement_modal(announcement)
        );

        $('#announcement_alert_container').html(
            make_alert(announcement, function () {
                $('#show_announcement_modal').modal('show');
            })
        );
    });
    socket.on('disconnect', function (evt) {
        //socket.emit('user_offline',)
        console.log('Connection closed.');
    });

    //close before webpage quit
    window.onbeforeunload = function () {
        socket.close()
    };

    //wire actions
    $('#msg_submit').click(function () {
        //socket.emit('create-message', {
        //    content: $('#msg_input').val()
        //});
        var message = $('#msg_input').val();
        $.post("/v1/rooms/" + room_id + "/messages", { "content": message });
        $('#msg_input').val('');
    });

    $('#msg_input').keydown(function (event) {
        if (event.keyCode == 13) {
            $('#msg_submit').click();
            return false;
        }
    });


    function load_history() {
        socket.emit('get-history', {
            until: current_messages.length > 0 ? current_messages[0].timestamp : new Date(),
            limit: 10
        });
    }
    $('#more_history').click(function () {
        load_history();
    });

    $('#card-title').click(function () {
        $('#online-users-list').toggle();
    });

    //load history once at init
    load_history();
    //and scroll to bottom
    var chatlist = $('#chat-list');
    chatlist.scrollTop(chatlist[0].scrollHeight);

    //welcome modal
    if (newMember) {
        $('#welcome-modal').modal('show');
    }

    $('.status-btn').click(function () {
        var un = username;
        $.ajax({
            type: 'PUT',
            url: '/v1/users/' + un,
            data: { status: this.name },
            success: function (res) {
                $('#confirm_share_satus_modal').modal('hide');
            }
        });
    });

    //get key words
    $('#navbar_search_form').on('submit', function (event) {
        event.preventDefault();
        var text = $('#navbar_search_form').find('input').val();
        click_search_message(text);
    });

});


