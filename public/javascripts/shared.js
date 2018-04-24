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

var emergency_msg;
function make_emergency_alert(emergency, click_callback) {
    emergency_msg = emergency;
    //return DOM of one alert
    //.alert.alert-danger ANNOUNCEMENT: 8.0 earthquake at SF, SAN JOSE
    console.log("make emergency message");

    var html =
        '<div class="alert alert-danger m-2"> <a href="#" class="close" data-dismiss="alert" onclick = "no_display(emergency_msg[0].sender)"> &times; </a> ' + "Emergency message from " + emergency[0].sender.username + '</div>';
    var dom = $($.parseHTML(html)[0]);
    dom.on('click', function () {
        click_callback(emergency);
    });
    return dom;
}

function no_display(userid){
    var data ={};
    console.log(userid);
    data['id'] = userid._id;
        $.ajax({
            url: '/v1/emergencymessage/changeisshown',
            type: 'POST',
            data: data,
            success: function () {
                // show a modal
                console.log("successful");
                $('#show_add_emergency_modal').modal('close');
                //location.reload(true);
            }
        });
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

function make_emergency_modal(emergency) {
    console.log('calling make emergency modal');
    //return HTML of modal content
    var html =
        '<h1>' + "Emergency Message" + '</h1>' +
        '<p>Sender: <strong>' + emergency[0].sender.username + '</strong>' +
        '<br/>' +
        'time: <strong>' + new Date(emergency[0].timestamp).toLocaleDateString() + '</strong></p>' +
        '<p>' + emergency[0].message + '</p>';
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

function make_select_user_box(user){
    var username = user.username;
    var html = "<option value =" + username +"> " + username + " </option>";
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


function make_message_modal(messages) {
    var html = "";
    messages.forEach(function (message) {
        html
            += '<div class="chat-box m-2">'
            + '<div class="d-flex justify-content-between w-100 mb-2">'
            + '<div class="text-muted">' + message.sender.username + '</div>'
            + '<div class="text-muted">' + new Date(message.timestamp).toLocaleTimeString() + '</div>'
            + '</div>'
            + '<div class="' + color + ' p-2 rounded text-white">' + message.content + '</div>'
            + '</div>'
            ;
    });

    return html;
}

function click_search_message(text) {
    var current_messages = [];

    $.get("/v1/rooms/" + room_id + "/messages", { sort: "+timestamp", query: text }, function (data) {
        Array.prototype.push.apply(current_messages, data);

        current_messages.sort(function (a, b) {
            var aDate = new Date(a.timestamp);
            var bDate = new Date(b.timestamp);
            return aDate.getTime() - bDate.getTime();
        });
        var html_text = make_message_modal(current_messages);

        $('#message_modal_body').html(html_text);
        $('#show_message_modal').modal('show');
    });



}


function concatenate_message(current_messages, data) {
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
}


//returns HTML of pagination <li>s
//i = current_page + 1
//if n >= 5:
//      if i > 2 && i < n-2:   prev 1 ... i-1 i ...   i+1   n next
//      else:                  prev 1 2 ...  n-1   n      next (no i)
//else e.g. n=3: prev 1 2 3 next
function make_pagination(info, current_page) {
    function make_li(name, page) {
        /*
            li.page-item
                a.page-link(href='#') 1
        */
        var li_class = "page-item";
        if (page == current_page) {
            li_class += " active";
        }

        var result = '<li class="' + li_class + '">' +
            '   <a class="page-link" onclick="click_page(guide_info,' + page + ');">' + name + '</a>' +
            '</li>';
        return result;
    }
    var pageCount = Math.ceil((info.count + 0.0) / info.pageSize);
    var i = current_page + 1;
    if (i > pageCount) {
        i = 1;
    }
    var result = "";
    //pageCount and i ok
    if (pageCount > 5) {
        if (i > 1 && i < pageCount - 1) {
            result =
                make_li('Prev', i - 2) +
                make_li('1', 0) +
                make_li('...', null) +
                make_li(i - 1, i - 2) +
                make_li(i, i - 1, true) +
                make_li(i + 1, i) +
                make_li('...', null) +
                make_li(pageCount, pageCount - 1) +
                make_li('Next', i);
        } else {
            result =
                make_li('Prev', i - 2) +
                make_li(1, 0) +
                make_li(2, 1) +
                make_li('...', null) +
                make_li(pageCount - 1, pageCount - 2) +
                make_li(pageCount, pageCount - 1) +
                make_li('Next', i);
        }
    } else if (pageCount > 1) {
        if (current_page > 0) {
            result = make_li('Prev', i - 2);
        }
        for (var j = 0; j < pageCount; ++j) {
            result += make_li(j + 1, j);
        }
        if (current_page + 1 < pageCount) {
            result += make_li('Next', i);
        }
    } else {
        //pageCount = 0
        result = "";
    }
    return result;
}
