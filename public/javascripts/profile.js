

$('document').ready(function () {
    var new_status='';
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
    		url: '/v1/users/change_status/'+ un,
    		data: {status: new_status},
    		success: function(res) {
    			$('#confirm_share_satus_modal').modal('hide');
            }
        });
    });
});
