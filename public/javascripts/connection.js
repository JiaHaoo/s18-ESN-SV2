function make_doms(messages) {
    var html_text = "";
    messages.map(function (message) {
        if (message.sender.username === displayname) {
            name = "Me"
            color = "bg-success text-white"
        } else {
            name = message.sender.username
            color = "bg-primary text-white"
        }

        var badge_type = badgeType(message.senderStatus);
        badge = '<span class="badge badge-pill ' + badge_type + ' mx-2">' + message.senderStatus + '</span>'

        html_text
            += '<div class="chat-box m-2">'
            + '<div class="d-flex justify-content-between w-100 mb-2">'
            + '<div class="text-muted">' + name + badge + '</div>'
            + '<div class="text-muted">' + new Date(message.timestamp).toLocaleTimeString() + '</div>'
            + '</div>'
            + '<div class="' + color + ' p-2 rounded text-white">' + message.content + '</div>'
            + '</div>'
            ;

    });
    return html_text;
}

function badgeType(status) {
    if (status == 'ok')
        return 'badge-success';
    else if (status == 'help')
        return 'badge-warning';
    else if (status == 'emergency')
        return 'badge-danger';
    else if (status == 'undefined')
        return 'badge-dark'
    return 'badge-secondary';
}

$('document').ready(function () {
    var current_messages = [];
    var socket = io();
    socket.on('connect', function (evt) {
        console.log('Connection open ...');
        $('#online-users-list').hide();
        $.get("/v1/rooms/" + room_id + "/messages", { sort: "+timestamp" }, function (data) {
            Array.prototype.push.apply(current_messages, data);
            current_messages.sort(function (a, b) {
                var aDate = new Date(a.timestamp);
                var bDate = new Date(b.timestamp);
                return aDate.getTime() - bDate.getTime();
            });
            var html_text = make_doms(current_messages);
            var chatlist = $('#chat-list');
            chatlist.html(html_text);
            chatlist.scrollTop(chatlist[0].scrollHeight);
        }, 'json');
    });


    // socket.on('userlist_update', function (data) {
    //     var html_text = "";
    //     data.online.forEach(function (username) {
    //         html_text +=
    //             '<li class="list-group-item">' +
    //             username + '<span class="badge badge-pill badge-primary mx-2">online</span>' +
    //             '</li>';
    //     });
    //     data.offline.forEach(function (username) {
    //         html_text +=
    //             '<li class="list-group-item", style="color:#aaa">' +
    //             username + '<span class="badge badge-pill badge-secondary mx-2">offline</span>' +
    //             '</li>';
    //     });
    //     $('#online-users-list').html(html_text);
    // });

    // userpair[0] -> username, userpair[1] -> status
    socket.on('userlist_update', function (data) {
        var html_text = "";
        data.online.forEach(function (userpair) {
            var badge_type = badgeType(userpair[1]);
            var href = "/users/" + userpair[0] + "/chat";
            html_text +=
                '<a href="' + href + '" class="list-group-item">' +
                userpair[0] + '<span class="badge badge-pill ' + badge_type + ' mx-2">' + userpair[1] + '</span>' +
                '</a>';
        });
        data.offline.forEach(function (userpair) {
            var href = "/users/" + userpair[0] + "/chat";
            html_text +=
                '<a href="' + href + '" class="list-group-item", style="color:#aaa">' +
                userpair[0] + '<span class="badge badge-pill badge-secondary mx-2">' + userpair[1] + '</span>' +
                '</a>';
        });
        $('#online-users-list').html(html_text);
    });

    socket.on('show_messages', function (data) {
        data = data.filter(function (msg) {
            return msg.room === room_id;
        });
        Array.prototype.push.apply(current_messages, data);


        current_messages.sort(function (a, b) {
            var aDate = new Date(a.timestamp);
            var bDate = new Date(b.timestamp);
            return aDate.getTime() - bDate.getTime();
        });

        var html_text = make_doms(current_messages);
        var chatlist = $('#chat-list');
        chatlist.html(html_text);

        chatlist.scrollTop(chatlist[0].scrollHeight);
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
            url: '/v1/users/change_status/' + un,
            data: { status: this.name },
            success: function (res) {
                $('#confirm_share_satus_modal').modal('hide');
            }
        });
    });

});


