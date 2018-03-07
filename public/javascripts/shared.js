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
    //return HTML of modal content
    var html =
        '<h1>' + announcement.title + '</h1>' +
        '<p>Sender: <strong>' + announcement.sender.displayname + '</strong>' +
        '<br/>' +
        'Publish time: <strong>' + new Date(announcement.timestamp).toLocaleDateString() + '</strong></p>' +
        '<p>' + announcement.content + '</p>';
    return html;
}