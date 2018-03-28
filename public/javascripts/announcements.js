var search_announcement_keyword;

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

/**
 * called when click page <li>s in pagination bar.
 * get list of announcements from api
 * and format them and put to content div.
 *
 * will check `search_announcement_keyword` to see if current mode is search mode or all mode.
 *
 * @param info
 * @param page
 */
function click_page(info, page) {


    if (page === null) {
        //do nothing
        return;
    }
    var limit = "limit=" + info.pageSize;
    var offset = "offset=" + page * info.pageSize;
    var query = "";
    if (search_announcement_keyword) {
        query = "query=" + search_announcement_keyword;
    }
    $.get('/v1/announcements?' + [limit, offset, query].join('&'))
        .done(function (response) {
            //title
            var title = "Announcments";
            if (search_announcement_keyword) {
                title = "Search results for " + search_announcement_keyword;
            }
            $('#announcement_page_title').html(title);

            //content
            var content = $('#announcements_content');
            content.empty();
            response.announcements
                .map(function (announcement) {
                    return make_alert(announcement, click_announcement);
                })
                .forEach(element => {
                    content.append(element);
                });

            //pagination
            $('#announcement_pagination').html(
                make_pagination(info, page)
            );
        });
}

function click_announcement(announcement) {
    $('#announcement_modal_body').html(make_announcement_modal(announcement));
    console.log('after returning html');
    $('#show_announcement_modal').modal('show');
}

function click_search_announcement(keyword) {
    search_announcement_keyword = keyword;
    click_page(announcement_info, 0);
}

function show_create_modal() {
    $('#create_announcement_modal').modal('show');
}

$('document').ready(function () {
    //annoucement_info: count, pageSize
    click_page(announcement_info, 0);
    $('#create_announcement_form').on('submit', function (event) {
        event.preventDefault();
        var data = {};
        $.map($(this).serializeArray(), function (n, i) {
            data[n['name']] = n['value'];
        });
        //data ok
        $.ajax({
            url: '/v1/announcements',
            type: 'POST',
            data: data,
            success: function () {
                location.reload(true);
            }
        });
    });
    $('#navbar_search_form').on('submit', function (event) {
        event.preventDefault();
        var text = $('#navbar_search_form').find('input').val();
        console.log(text);
        click_search_announcement(text);
    });
});