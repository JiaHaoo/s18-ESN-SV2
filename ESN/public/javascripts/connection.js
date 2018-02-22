function make_doms(messages) {
    var html_text = "";
    messages.map(function (message) {
        if (message.user == displayname) {
            name = "Me"
            color = "bg-success text-white"
        } else {
            name = message.user
            color = "bg-primary text-white"
        }

        html_text
            += '<div class="chat-box m-2">'
            + '<div class="d-flex justify-content-between w-100 mb-2">'
            + '<div class="text-muted">' + name + '</div>'
            + '<div class="text-muted">' + new Date(message.timestamp).toLocaleTimeString() + '</div>'
            + '</div>'
            + '<div class="' + color + ' p-2 rounded text-white">' + message.content + '</div>'
            + '</div>'
            ;

    });
    return html_text;
}

$('document').ready(function () {
    var current_messages = [];
    var socket = io();
    socket.on('connect', function (evt) {
        console.log('Connection open ...');
    });

    socket.on('show-messages', function (data) {

        Array.prototype.push.apply(current_messages, data.messages);

        current_messages.sort(function (a, b) {
            var aDate = new Date(a.timestamp);
            var bDate = new Date(b.timestamp);
            return aDate.getTime() - bDate.getTime();
        });

        var html_text = make_doms(current_messages);
        var chatlist = $('#chat-list');
        chatlist.html(html_text);

        if (data.request === 'get-history') {
            chatlist.scrollTop(0);
        } else if (data.request === 'create-message') {
            chatlist.scrollTop(chatlist[0].scrollHeight);
        }
    });

    socket.on('show-users', function (data) {
        var html_text = "";
        data.map(function (online_username) {
            html_text += '<li class="list-group-item">' + online_username + '</li>';
        })
        $('#online-users-list').html(html_text);
    });

    socket.on('disconnect', function (evt) {
        console.log('Connection closed.');
    });

    //close before webpage quit
    window.onbeforeunload = function () {
        socket.close()
    };

    //wire actions
    $('#msg_submit').click(function () {
        socket.emit('create-message', {
            content: $('#msg_input').val()
        });
        $('#msg_input').val('');
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

    //load history once at init
    load_history();
    //and scroll to bottom
    var chatlist = $('#chat-list');
    chatlist.scrollTop(chatlist[0].scrollHeight);

    //welcome modal
    if (newMember) {
        console.log('new member');
        $('#welcome-modal').modal('show');
    }

});


