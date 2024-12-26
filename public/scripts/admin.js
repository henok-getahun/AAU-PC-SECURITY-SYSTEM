$(document).ready(function() {

    $('.toggle-btn').on('click', toggleMobileMenu);

    $('#change-password-form').on('submit', handleChangePassword);

    $('form[action="/registerStudent"]').on('submit', handleRegisterStudent);

    $('form[action="/registerGuard"]').on('submit', handleRegisterGuard);

    $('form[action="/updateStudent"]').on('submit', handleUpdateStudent);

    $('form[action="/updateGuard"]').on('submit', handleUpdateGuard);
});

function toggleMobileMenu() {
    const $icon = $(this).find("i");
    $icon.toggleClass("fa-bars fa-close");
    $('.dropdown-menu-mobile').toggleClass("open");
}

function handleChangePassword(event) {
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
                url: '/admin/changePassword',
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
}

function handleRegisterStudent(event) {
    event.preventDefault();
    const studentId = $(this).find('input[name="student_id"]').val();
    const selector = $('#register_stud .server.message');

    $.ajax({
        type: 'POST',
        url: '/admin/student',
        contentType: 'application/json',
        data: JSON.stringify({ studentId, action: 'fetch' }), 
        success: function(student) {
            displayStudentInfo(student);
        },
        error: function(xhr) {
            serverMessage(xhr.responseJSON.error, selector, 'error');
        }
    });
}

function displayStudentInfo(student) {
    const studentInfo = $('#register_stud > .student-info');
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
            <div class="btns">
                <a href="#" class="btn" id="back">Back</a>
                <a href="#" class="btn" id="register">Register</a>
            </div>
            <div class="server-message">
                <div class="server message"></div>
            </div>
        </div>
    `;
    studentInfo.html(html).show();

    $('#register_stud').off('click', '#back').off('click', '#register');

    $('#register_stud').on('click', '#back', function(event) {
        event.preventDefault();
        studentInfo.empty().hide();
        $('#checking-container').show();
    });

    $('#register_stud').on('click', '#register', function(event) {
        event.preventDefault();
        registerStudent(student.id);
    });
}

function registerStudent(studentId) {
    const selector = $('#register_stud .details .server.message');
    $.ajax({
        type: 'POST',
        url: '/admin/student', 
        contentType: 'application/json',
        data: JSON.stringify({ studentId, action: 'register' }),
        success: function(response) {
            serverMessage(response.message, selector, 'success');
        },
        error: function(xhr) {
            serverMessage(xhr.responseJSON.error, selector, 'error');
        }
    });
}

function handleRegisterGuard(event) {
    event.preventDefault();
        let formData = new FormData(this);
        formData.append('action', 'fetch');
        let selector = $('#register_guard .server.message');
        $.ajax({
            url: '/admin/guard',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                const guardData = response.guardData;
                const guardInfoSection = $('#register_guard > .guard-info');
                guardInfoSection.empty();
                $('#register_guard #guardInfo').hide()
    
                const html = `
                    <div class="profile-pic">
                        <img src="/images/uploads/${guardData.file_name}" alt="">
                    </div>
                    <div class="details">
                        <p><strong>Full Name:</strong> ${guardData.guard_name}</p>
                        <p><strong>SSN:</strong> ${guardData.guard_ssn}</p>
                        <p><strong>Email:</strong> ${guardData.email}</p>
                        <p><strong>Phone No:</strong> ${guardData.phone_no}</p>
                        <p><strong>ID:</strong> ${guardData.guard_id}</p>
                        <div style="margin-bottom:20px">
                            <a href="#" class="btn" id="back">Back</a>
                            <a href="#" class="btn" id="register">Register</a>
                        </div>
                        <div class="server-message">
                            <div class="server message"></div>
                        </div>
                    </div>
                `;
                guardInfoSection.html(html).show();
    
                $('#register_guard').off('click', '#back').on('click', '#back', function(event) {
                    event.preventDefault();
                    guardInfoSection.empty().hide();
                    $('#guardInfo').show();
                });
    
                $('#register_guard').off('click', '#register').on('click', '#register', function(event) {
                    event.preventDefault();
                    formData.set('action', 'register'); 
                    let selector2 = $('#register_guard .details .server.message');

                    $.ajax({
                        url: '/admin/guard',
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function(response) {
                            let className = 'success';

                            serverMessage(response.message, selector2, className);
                           $('#change-password-form')[0].reset(); 
                        },
                        error: function(xhr) {
                            const errorMessage = xhr.responseJSON.error 
                            let className = 'error';
                            serverMessage(errorMessage,selector2, className);
                        }
                    });
                });
            },
            error: function(xhr) {
                const errorMessage = xhr.responseJSON.error ;
                serverMessage(errorMessage, selector, 'error');
            }
        });
}



function handleUpdateStudent(event) {
    event.preventDefault();
    const studentId = $(this).find('input[name="student_id"]').val();
    const selector = $('#update_student_data .server.message');

    $.ajax({
        type: 'POST',
        url: '/admin/updateStudent',
        contentType: 'application/json',
        data: JSON.stringify({ studentId, action: 'fetch' }),
        success: function(student) {
            displayUpdateStudentInfo(student);
        },
        error: function(xhr) {
            serverMessage(xhr.responseJSON.error, selector, 'error');
        }
    });
}

function displayUpdateStudentInfo(student) {
    const studentInfo = $('#update_student_data > .student-info');
    $('#update_student_data > #inputId').hide();

    const html = `
        <div class="profile-pic">
            <img src="${student.pic_url}" alt="Student picture" />
        </div>
        <div class="details">
            <p><strong>Full Name:</strong> ${student.full_name}</p>
            <p><strong>Department:</strong> ${student.department}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>ID:</strong> ${student.id}</p>
            <p><strong>Year:</strong> ${student.year}</p>
            <div class="btns">
                <a href="#" class="btn" id="delete">Delete</a>
                <a href="#" class="btn" id="reset">Reset Password</a>
            </div>
            <div class="server-message">
                <div class="server message"></div>
            </div>
        </div>
    `;
    studentInfo.html(html).show();

    $('#update_student_data .student-info').off('click', '#delete').on('click', '#delete', function(event) {
        event.preventDefault();
        deleteStudent(student.id);
    });

    $('#update_student_data .student-info').off('click', '#reset').on('click', '#reset', function(event) {
        event.preventDefault();
        resetStudentPassword(student.id);
    });
}

function deleteStudent(studentId) {
    const selector = $('#update_student_data .details .server.message');

    $.ajax({
        type: 'POST',
        url: '/admin/updateStudent',
        contentType: 'application/json',
        data: JSON.stringify({ studentId, action: 'delete' }),
        success: function(response) {
            serverMessage(response.message, selector, 'success');
            setTimeout(() => {
                $('#update_student_data > .student-info').empty().hide();
                $('#update_student_data > #inputId').show();
            }, 3000);
        },
        error: function(xhr) {
            serverMessage(xhr.responseJSON.error, selector, 'error');
        },
    });
}

function resetStudentPassword(studentId) {
    const selector = $('#update_student_data .details .server.message');

    $.ajax({
        type: 'POST',
        url: '/admin/updateStudent',
        contentType: 'application/json',
        data: JSON.stringify({ studentId, action: 'resetPassword' }),
        success: function(response) {
            serverMessage(response.message, selector, 'success');
            setTimeout(() => {
                $('#update_student_data > .student-info').empty().hide();
                $('#update_student_data > #inputId').show();
            }, 3000);
        },
        error: function(xhr) {
            serverMessage(xhr.responseJSON.error, selector, 'error');
        },
    });
}

function handleUpdateGuard(event) {
    event.preventDefault();
    const guardId = $(this).find('input[name="guard_id"]').val();
    const selector = $('#update_guard_data .server.message');

    $.ajax({
        type: 'POST',
        url: '/admin/updateGuard',
        contentType: 'application/json',
        data: JSON.stringify({ guardId, action: 'fetch' }),
        success: function(guard) {
            displayUpdateGuardInfo(guard);
        },
        error: function(xhr) {
            serverMessage(xhr.responseJSON.error, selector, 'error');
        }
    });
}

function displayUpdateGuardInfo(guard) {
    const guardInfo = $('#update_guard_data > .guard-info');
    $('#update_guard_data > #inputId').hide();

    const html = `
        <div class="profile-pic">
            <img src="/images/uploads/${guard.file_name}" alt="guard picture" />
        </div>
        <div class="details">
            <p><strong>Guard Name:</strong> ${guard.guard_name}</p>
            <p><strong>Email:</strong> ${guard.email}</p>
            <p><strong>Phone No:</strong> ${guard.phone_no}</p>
            <p><strong>SSN:</strong> ${guard.guard_ssn}</p>
            <p><strong>ID:</strong> ${guard.guard_id}</p>
            <div class="btns">
                <a href="#" class="btn" id="delete">Delete</a>
                <a href="#" class="btn" id="reset">Reset password</a>
            </div>
            <div class="server-message">
                <div class="server message"></div>
            </div>
        </div>
    `;
    guardInfo.html(html).show();

    $('#update_guard_data').off('click', '#delete').on('click', '#delete', function(event) {
        event.preventDefault();
        deleteGuard(guard.guard_id);
    });

    $('#update_guard_data').off('click', '#reset').on('click', '#reset', function(event) {
        event.preventDefault();
        resetGuardPassword(guard.guard_id);
    });
}

function deleteGuard(guardId) {
    const selector = $('#update_guard_data .details .server.message');

    $.ajax({
        type: 'POST',
        url: '/admin/updateGuard',
        contentType: 'application/json',
        data: JSON.stringify({ guardId, action: 'delete' }),
        success: function(response) {
            serverMessage(response.message, selector, 'success');
            setTimeout(() => {
                $('#update_guard_data > .guard-info').empty().hide();
                $('#update_guard_data > #inputId').show();
            }, 3000);
        },
        error: function(xhr) {
            serverMessage(xhr.responseJSON.error, selector, 'error');
        }
    });
}

function resetGuardPassword(guardId) {
    const selector = $('#update_guard_data .details .server.message');

    $.ajax({
        type: 'POST',
        url: '/admin/updateGuard',
        contentType: 'application/json',
        data: JSON.stringify({ guardId, action: 'resetPassword' }),
        success: function(response) {
            serverMessage(response.message, selector, 'success');
            setTimeout(() => {
                $('#update_guard_data > .guard-info').empty().hide();
                $('#update_guard_data > #inputId').show();
            }, 3000);
        },
        error: function(xhr) {
            serverMessage(xhr.responseJSON.error, selector, 'error');
        }
    });
}

function serverMessage(message, selector, className) {
    selector.html(`<p class="${className}">${message}</p>`).fadeIn().delay(2000).fadeOut();
}
