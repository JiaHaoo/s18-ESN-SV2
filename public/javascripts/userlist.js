
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

function make_badge_span(status, badge_type) {
    return '<span class="badge badge-pill ' + badge_type + ' mx-2">' + status + '</span>';
}

function make_userlist_item(userinfo, online) {
    var item_username = userinfo[0];
    var status = userinfo[1];
    var style = online ? '' : 'style="color:#aaa"';
    var badge_type = online ? badgeType(status) : 'badge-secondary';
    // if this user is me, do not add link
    var href = username === item_username ? '#' : '/users/' + item_username + '/chat';
    var html = '<a href="' + href + '" class="list-group-item" ' + style + 'name="' + item_username + '" > ' +
        item_username + make_badge_span(status, badge_type) + '</a>';
    return html;
}

/**
 * highlight this item in userlist.
 * highlight using bg-warning (yellow)
 * if not exist, do nothing
 * @param username 
 */
function highlight_userlist_item(username) {
    $('.list-group-item[name=' + username + ']').addClass('bg-warning')
}

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


