$(document).ready(function(){
    $('.toggle-btn').on('click', function() {
        const $icon = $(this).find("i");
        $icon.toggleClass("fa-bars fa-close");
        $('.dropdown-menu-mobile').toggleClass("open");
    });
    
$('#change-password-form').on('submit', function(event) {
    const newPassword = $('#new_password').val();
    const confirmNewPassword = $('#confirm_new_password').val();
    const errorMessage = $('#error-message');
    const currentPassword = $('#current_password').val();
    const studentId = $('#student_id').val()

    event.preventDefault();
    if (newPassword !== confirmNewPassword) {
        errorMessage.fadeIn().delay(500).fadeOut();
        confirmNewPassword.val('').focus(); 
    } else {
        let selector = $('#manage_account .server.message');
        $.ajax({
            type: 'POST',
            url: '/student/changePassword',
            contentType: 'application/json',
            data: JSON.stringify({ 
                current_password:currentPassword,
                new_password: newPassword,
                student_id:studentId

            }),
            success: function(response) {
                let className = 'success';
                serverMessage(response.message, selector, className);
                $('#change-password-form')[0].reset(); 
            },
            error: function(xhr) {
                let className = 'error';
                $('#current_password').val('').focus(); 
                serverMessage(xhr.responseJSON.error,selector, className);
            }
        });
    }
});

function serverMessage(message, selector, className) {
    const messageDiv = selector;
    messageDiv.html(`<p class=${className}> ${message}</p>`).fadeIn().delay(500).fadeOut();
}

$('form[action="/registerPc"]').on('submit', function(event) {
    event.preventDefault();
    let selector = $('#register-pc .server.message');
    let formData = new FormData(this);     
    $.ajax({
        url: '/student/registerPc', // Ensure this matches the route
        type: 'POST',
        data: formData,
        processData: false, 
        contentType: false, 
        success: function(response) {
            let className = 'success';
            serverMessage(response.message, selector, className);
        },
        error: function(xhr, status, error) {
            let className = 'error';
            serverMessage(xhr.responseJSON.error, selector, className);
        }
    });
});

$('form[action="/reportStolenPc"]').on('submit', function(event) {
    event.preventDefault();
    let selector = $('#report .server.message');
    let formData = new FormData(this);     
    $.ajax({
        url: '/reportStolenPc',
        type: 'POST',
        data: formData,
        processData: false, 
        contentType: false, 
        success: function(response) {
            let className = 'success';
            serverMessage(response.message, selector, className);
        },
        error: function(xhr, status, error) {
            let className = 'error';
            serverMessage(xhr.responseJSON.error, selector, className);
        }
    });
});


$('.details-btn').click(function() {
    const card = $(this).closest('.pc-card'); 
    const pcInfo = card.find('.pc-info');
    const btn = $(this);

    pcInfo.slideToggle(300, function() {
        btn.toggleClass('active');
    });
});
    
// Handle Edit button click
$('.edit-btn').click(function() {
    const form = $(this).closest('form');
    form.find('input').not(':first').prop('readonly', false); 
    form.find('.edit-btn').hide(); 
    form.find('.submit-btn').show(); 
});


    
    
// Edit PC information
$('.edit-form').submit(function(e) {
    let selector = $('#update-pc .server.message');
    e.preventDefault();
    const formData = $(this).serialize();
    $.ajax({
        url: '/student/pc/edit',
        method: 'PUT',
        data: formData,
        success: function(response) {
            let className = 'success';
            serverMessage(response.message, selector, className);
            setTimeout(()=>{
              location.reload();
            }, 2000)        
        },
        error: function(error) {
            let className = 'error';
            serverMessage(error.responseJSON.message, selector, className);
        }
    });
});

// Handle Delete button click
$('.delete-btn').click(function() {
    let selector = $('#update-pc .server.message');
    if (confirm('Are you sure you want to delete this PC?')) {
        const serial = $(this).closest('form').find('input[name="PcSerial"]').val();
        $.ajax({
            url: '/student/pc/delete',
            method: 'DELETE',
            data: { serial: serial },
            success: function(response) {
                let className = 'success';
                serverMessage(response.message, selector, className);
                setTimeout(()=>{
                  location.reload();
                }, 2000)  
            },
            error: function(error) {
                alert('Error deleting PC: ' + error.responseJSON.message);
            }
        });
    }
});


})