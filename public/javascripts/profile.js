

$('document').ready(function () {
    var new_status;
    $('.status-btn').click(function() {
        new_status = this.name;
        $('#confirm_status').html(new_status); 
        $('#confirm_share_satus_modal').modal('show');
    });
});
