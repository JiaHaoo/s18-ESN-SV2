$('document').ready(function () {
    var socket = io();
    console.log('before socket');
    socket.on('show_logout_message', function (msg) {
        console.log('in socket');
        var alert_id = '#logout-alert';
        //write_alert(alert_id, msg);
        show_alert()
    });

    $('#logout-modal-btn').on('click', function() {
        logout();
    });

});

function write_alert(alert_id, msg) {
    $(alert_id).find('p').text(msg);
}

function logout() {
    window.location.href = '/signout';
    $('#logout-alert').hide();
}

function show_alert() {
    $('#logout-alert').modal({ show: true, backdrop: 'static', keyboard: false });
}

