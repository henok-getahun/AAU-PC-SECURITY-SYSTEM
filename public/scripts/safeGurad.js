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
    
        event.preventDefault();
        if (newPassword !== confirmNewPassword) {
            errorMessage.fadeIn().delay(500).fadeOut();
            confirmNewPassword.val('').focus(); 
        } else {
            let selector = $('#manage_account .server.message');
            $.ajax({
                type: 'POST',
                url: '/guard/changePassword',
                contentType: 'application/json',
                data: JSON.stringify({ 
                    current_password: currentPassword, 
                    new_password: newPassword,
                    confirm_new_password: confirmNewPassword
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

    $('#verify').on('submit', function(event) {
        event.preventDefault();
        const pcSerial = $('#serial_no').val();
        const studentId = $('#student_id').val();
        
        let selector = $('#verify .server.message');
    
        $.ajax({
            type: 'POST',
            url: '/guard/verify',
            contentType: 'application/json',
            data: JSON.stringify({ 
                pc_serial: pcSerial, 
                student_id: studentId
                
            }),
            success: function(response) {
                let className = 'success';
                serverMessage(response.message, selector, className);
                $('#verify')[0].reset(); 
            },
            error: function(xhr) {
                let className = 'error';
                serverMessage(xhr.responseJSON.error,selector, className);
            }
        });
    
    });
    

    $('form[action="/studentInfo"]').on('submit', function(event) {
        event.preventDefault(); 
        let studentId = $(this).find('input[name="student_id"]').val();
        let selector = $('#student-info .server.message');
        $.ajax({
            type: 'POST',
            url: '/guard/studentInfo',
            contentType: 'application/json',
            data: JSON.stringify({ studentId}), 
            success: function(student) { 
                const studentInfo = $('#student-info > .student-info');
                studentInfo.empty(); 
                $('#checking-container').hide(); 
                
                const html = `
                    <div class="profile-pic">
                        <img src="${student.pic_url}" alt="student picture" />
                    </div>
                    <div class="details">
                        <p><strong>Full Name:</strong> ${student.full_name}</p>
                        <p><strong>Department:</strong> ${student.department}</p>
                        <p><strong>Email:</strong> ${student.email}</p>
                        <p><strong>ID:</strong> ${student.id}</p>
                        <p><strong>Year:</strong> ${student.year}</p>
                    </div>`;
                studentInfo.html(html).show(); 
            },
            error: function(xhr) {
                let className = 'error';
                serverMessage(xhr.responseJSON.error,selector, className);
            }
        });

    });

        // Listen for stolen PC reports

    const socket = io();
    socket.on('stolenPCReported', function(pcData) {
        const alertSection = $('#alert .alert');
        $('#alert h2').fadeOut();
        $('.nav-links .alert').html(`Alert <span class="notification">1</span>`)
        alertSection.empty().fadeIn; 
        const html = `
             <h1 ">New laptop lost report!</h1>
             <div class="pc-info">
                <p><strong>PC Brand</strong>: ${pcData.pcBrand.toUpperCase()}</p>
                <p><strong>PC Model</strong>: ${pcData.pcModel.toUpperCase()}</p>
                <p><strong>PC Serial No</strong>: ${pcData.pcSerial.toUpperCase()}</p>
                <div>
                    <img src='${pcData.pcImage}' alt="pc-image" class="pc-image">
                    <figcaption>Laptop image</figcaption>
                </div>
           </div>

        `;

        alertSection.html(html).show(); 
    });
    
    function serverMessage(message, selector, className) {
        const messageDiv = selector;
        messageDiv.html(`<p class=${className}> ${message}</p>`).fadeIn().delay(3000).fadeOut();
    }



})