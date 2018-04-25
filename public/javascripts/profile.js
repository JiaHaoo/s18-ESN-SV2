var pre_status ='';
var new_status='';
$('document').ready(function () {
    pre_status = status;
    console.log(pre_status);
    $('.status-btn').click(function() {
        new_status = this.name;
        $('#confirm_status').html(new_status); 
        $('#confirm_share_satus_modal').modal('show');
    });
    $('#confirm_change_status').click(function(){
        console.log('confirmed change status');
        //$.put("/v1/users/change_status", { "status": new_status });
        var un = username;
        $.ajax({
    		type: 'PUT',
    		url: '/v1/users/'+ un,
    		data: {status: new_status},
    		success: function(res) {
    			$('#confirm_share_satus_modal').modal('hide');
                if (new_status === 'emergency')
                	send_message();
                else
                    BackToESN();
            }
        });
    });
});


function send_message() {
    var isEmergency = 'false';
    // emergency => others
    // get a emergency contact && send a message to inform that everything is OK;

    if (new_status === 'emergency') {
        isEmergency= 'true';
    }
    var user_name = "username=" + username;
    var states = "isEmergency="+isEmergency;
    console.log(user_name);
    $.ajax({
        type:'GET',
        url: '/v1/emergencymessage/get_room?'+ [user_name, states].join('&'),
        success: function(res) {
            $('#confirm_send_message_modal').modal('show');
        }
    });

}

function BackToESN(){
    window.location.href='/';
}
