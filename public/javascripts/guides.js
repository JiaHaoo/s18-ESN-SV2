var activeTags = [];
var search_guide_keyword = "";

function show_create_modal() {
    $('#create_guide_modal').modal('show');
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