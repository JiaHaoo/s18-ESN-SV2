var search_message_modal_result = [];
var search_message_modal_search_query = "";



function make_message_modal(messages) {
    var html = "";

    messages.forEach(function (message) {
        var color;
        if (message.sender.username === username) {
            color = "bg-success text-white";
        } else {
            color = "bg-primary text-white";
        }
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

function load_search_message() {

    var offset = search_message_modal_result.length;

    $.get("/v1/rooms/" + room_id + "/messages", { sort: "+timestamp", count: 10, offset: offset, query: search_message_modal_search_query },
        function (data) {
            if (data.length < 10) {
                $('#show_message_modal_more_button').hide();
            }
            search_message_modal_result = search_message_modal_result.concat(data);
            var html_text = make_message_modal(search_message_modal_result);
            $('#message_modal_body').html(html_text);
        });
}

function click_search_message(text) {
        search_message_modal_result = [];
        $('#show_message_modal_more_button').show();
        search_message_modal_search_query = text;
        load_search_message();
        $('#show_message_modal').modal('show');

}

$('document').ready(function() {
    $('#show_message_modal_more_button').on( "click", function (e) {
        e.preventDefault();
        load_search_message();
    });
});
