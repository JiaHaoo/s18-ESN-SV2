function make_alert(announcement, click_callback) {
    //return DOM of one alert
    //.alert.alert-danger ANNOUNCEMENT: 8.0 earthquake at SF, SAN JOSE
    var html =
        '<div class="alert alert-danger m-2">' + announcement.title + '</div>';
    var dom = $($.parseHTML(html)[0]);
    dom.on('click', function () {
        click_callback(announcement);
    });
    return dom;
}

function make_announcement_modal(announcement) {
    console.log('calling make modal');
    //return HTML of modal content
    var html =
        '<h1>' + announcement.title + '</h1>' +
        '<p>Sender: <strong>' + announcement.sender.displayname + '</strong>' +
        '<br/>' +
        'Publish time: <strong>' + new Date(announcement.timestamp).toLocaleDateString() + '</strong></p>' +
        '<p>' + announcement.content + '</p>';
    return html;
}

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

        badge = make_badge_span(message.senderStatus, badgeType(message.senderStatus));

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

function make_badge_span(status, badge_type) {
    return '<span class="badge badge-pill ' + badge_type + ' mx-2">' + status + '</span>';
}

function make_userlist_item(user, online) {
    var item_username = user.username;
    var status = user.status;
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