function show_user_list(data) {
    var html_text = "";
    html_text += "<option> " + "please choose your emergency contact" + " </option>";;
    data.online.forEach(function (user) {
        html_text += make_select_user_box(user);
    });
    data.offline.forEach(function (user) {
        html_text += make_select_user_box(user);
    });
    $('#select_box').html(html_text);
}

function BackToESN(){
    window.location.href='/';
}


$('document').ready(function () {
    var socket = io();
    var emergency_contact;
    // userpair[0] -> username, userpair[1] -> status
    socket.on('userlist_update', function (data) {
        show_user_list(data);
    });

    //close before webpage quit
    window.onbeforeunload = function () {
        socket.close();
    };
    $('#select_box').on('click',function(){
        emergency_contact = $(this).val();
        console.log(emergency_contact);
    });
    // submit emergency contact
    $('#create_emergency_message_form').on('submit', function (event) {

        event.preventDefault();
        var data = {};
        $.map($(this).serializeArray(), function (n, i) {
            data[n['name']] = n['value'];
        });
        data['emergency_contact'] = emergency_contact;
        console.log(data);
        //data ok
        $.ajax({
            url: '/v1/emergencymessage',
            type: 'POST',
            data: data,
            success: function () {
                // show a modal
                console.log("successful");
                $('#show_add_emergency_modal').modal('show');
                //location.reload(true);
            }
        });
    });
});