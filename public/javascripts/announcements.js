var search_announcement_keyword;

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
