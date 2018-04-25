$('document').ready(function() {
    var socket = io();
    console.log('before socket');
    socket.on('show_logout_message', function(msg) {
        console.log('in socket');
        var alert_id = '#logout-alert';
        write_alert(alert_id, msg);
        $(alert_id).alert();
        window.location.href = '/signout';
    });
});

function write_alert(alert_id, msg)
{
    console.log('before writing alert: ');
    console.log($(alert_id).text());
    $(alert_id).text() = msg;
}

