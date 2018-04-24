var activeTags = [];
var search_guide_keyword = "";

function show_create_modal() {
    $('#create_guide_modal').modal('show');
}

function click_search_guide(keyword) {
    search_guide_keyword = keyword;
    click_page(guide_info, 0);
}

function make_clickable(guide, click_callback) {
    var html =
        '<div class="container guide">' +
        '<div class="row">' +
        '<div class="col-md-8 title">' + guide.title + '</div>' +
        '<div class="col-md-4 sender">' + guide.sender.username + '</div>' +
        '</div>' +
        '<div class="row"><div class="col-md-12 tags">';
    guide.tags.forEach(tag => {
        html += ' #' + tag;
    });
    html += '</div></div></div>';
    var dom = $($.parseHTML(html)[0]);
    dom.on('click', function () {
        click_callback(guide);
    });
    return dom;
}

function make_guide_modal(guide) {
    //return HTML of modal content
    var html =
        '<h1>' + guide.title + '</h1>' +
        '<div class="row"><div class="col-6">' + new Date(guide.timestamp).toLocaleDateString() +
        '</div><div class="col">' +
        guide.sender.displayname +
        '</div></div>' +
        '<p style="border:groove">' + guide.content + '</p>';
    guide.tags.forEach(tag => {
        html += ' #' + tag;
    });
    return html;
}

function click_guide(guide) {
    $('#guide_modal_body').html(make_guide_modal(guide));
    $('#show_guide_modal').modal('show');
}

function click_page(info, page) {
    if (page === null) {
        //do nothing
        return;
    }
    var pathPara = "";
    var limit = "limit=" + info.pageSize;
    var offset = "offset=" + page * info.pageSize;
    pathPara = [limit, offset].join('&');
    if (search_guide_keyword) {
        pathPara += "&query=" + search_guide_keyword;
    } else if (activeTags.length != 0) {
        pathPara += "&tags=" + activeTags.join(',');
    }
    $.get('/v1/guides?' + pathPara)
        .done(function (response) {
            //title
            var title = "Guides";
            if (search_guide_keyword) {
                title = "Search results for " + search_guide_keyword;
                $('#tags').hide();
                activeTags = [];
                $('.btn-tag').each(function () {
                    if ($(this).hasClass('active')) {
                        $(this).removeClass('active');
                    }
                });
            } else {
                if (!$('#tags').is(":visible")) {
                    $('#tags').show();
                }
            }
            $('#guide_page_title').html(title);

            //content
            var content = $('#guides_content');
            content.empty();
            info.count = response.count;
            response.guides
                .map(function (guide) {
                    return make_clickable(guide, click_guide);
                })
                .forEach(element => {
                    content.append(element);
                });

            //pagination
            $('#guide_pagination').html(
                make_pagination(info, page)
            );
        });
}

function enter_tags(tags) {
    var tags_content = $('#tags');
    html = '';
    tags.forEach(tag => {
        html += '<button type="button" class="btn btn-light btn-sm btn-tag" name="' + tag + '">' +
            '#' + tag + '</button>';
    });
    tags_content.html(html);
}

$('document').ready(function () {
    //guide_info: pageSize, count
    $('#tags').on('click', 'button', function () {
        $(this).toggleClass('active');
        activeTags = [];
        $('.btn-tag').each(function () {
            if ($(this).hasClass('active')) {
                activeTags.push($(this).prop('name'));
            }
        });
        click_page(guide_info, 0);
    });
    click_page(guide_info, 0);
    enter_tags(guide_info.tags);
    $('#create_guide_form').on('submit', function (event) {
        event.preventDefault();
        var data = {};
        $.map($(this).serializeArray(), function (n, i) {
            data[n['name']] = n['value'];
        });
        //data ok
        $.ajax({
            url: '/v1/guides',
            type: 'POST',
            data: data,
            success: function () {
                location.reload(true);
            }
        });
    });

    $('#navbar_search_form').on('submit', function (event) {
        event.preventDefault();
        search_guide_keyword = $('#navbar_search_form').find('input').val();
        click_search_guide(search_guide_keyword);
    });
});
