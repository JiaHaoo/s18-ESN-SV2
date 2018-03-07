function make_alert(announcement) {
    //return DOM of one alert
    //.alert.alert-danger ANNOUNCEMENT: 8.0 earthquake at SF, SAN JOSE
    var html =
        '<div class="alert alert-danger m-2">' + announcement.title + '</div>';
    var dom = $($.parseHTML(html)[0]);
    dom.on('click', function () {
        click_announcement(announcement);
    })
    return dom;
}

function make_announcement_modal(announcement) {
    //return HTML of modal content
    var html =
        '<h1>' + announcement.title + '</h1>' +
        '<p>Sender: <strong>' + announcement.sender.displayname + '</strong>' +
        '<br/>' +
        'Publish time: <strong>' + new Date(announcement.timestamp).toLocaleDateString() + '</strong></p>' +
        '<p>' + announcement.content + '</p>';
    return html;
}
function make_pagination(info, current_page) {
    //returns HTML of pagination <li>s
    //i = current_page + 1
    //if n >= 5:
    //      if i > 2 && i < n-2:   prev 1 ... i-1 i ...   i+1   n next
    //      else:                  prev 1 2 ...  n-1   n      next (no i)
    //else e.g. n=3: prev 1 2 3 next
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
            '   <a class="page-link" onclick="click_page(announcement_info,' + page + ');">' + name + '</a>' +
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
    } else if (pageCount > 0) {
        result = make_li('Prev', i - 2);
        for (var j = 0; j < pageCount; ++j) {
            result += make_li(j + 1, j);
        }
        result += make_li('Next', i);
    } else {
        //pageCount = 0
        result = "";
    }
    return result;
}

function click_page(info, page) {
    //get
    //update alerts
    //update pagination

    if (page === null) {
        //do nothing
        return;
    }
    $.get('/v1/announcements?limit=' + info.pageSize + '&offset=' + page * info.pageSize)
        .done(function (response) {
            var content = $('#announcements_content');
            content.empty();
            response.announcements
                .map(make_alert)
                .forEach(element => {
                    content.append(element);
                });
            $('#announcement_pagination').html(
                make_pagination(info, page)
            );
        });
}

function click_announcement(announcement) {
    $('#announcement_modal_body').html(make_announcement_modal(announcement));
    $('#show_announcement_modal').modal('show');
}

$('document').ready(function () {
    //annoucement_info: count, pageSize
    click_page(announcement_info, 0);
});