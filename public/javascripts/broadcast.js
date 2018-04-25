$('document').ready(function () {
    var socket = io();
    console.log('before socket');

    //var alert_id = '#logout-alert';
    //console.log($(alert_id).find('p').text());
    //console.log($('#content').text());

    socket.on('show_logout_message', function (msg) {
        console.log('in socket');
        var alert_id = '#logout-alert';
        write_alert(alert_id, msg);
        show_alert()
    });
});

function write_alert(alert_id, msg) {
    console.log('before writing alert: ');
    console.log($(alert_id).find('p').text());
    $(alert_id).find('p').text(msg);
    console.log($(alert_id).find('p').text());
}

function logout() {
    window.location.href = '/signout';
    $('#logout-alert').hide();
}

function show_alert() {
    $('#logout-alert').modal({ show: true, backdrop: 'static', keyboard: false });
}

