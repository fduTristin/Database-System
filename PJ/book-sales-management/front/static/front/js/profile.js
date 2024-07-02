$.ajax({
    url: apiUrl,
    method: 'GET',
    dataType: 'json'
})
    .done(function (data) {
        //渲染信息
        $("#work_id").val(data['work_id']);
        $("#name").val(data['name']);
        $("#gender").val(data['gender']);
        $("#birthday").val(data['birthday']);
        $("#username").val(data['username']);
        $("#email").val(data['email']);
        $("#type").val(data['type']);
    })
    .fail(function (error) {
        console.error('Error fetching employee data:', error);
    });

let useDefault = false;

//相对路径转绝对路径
function toAbsURL(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.href;
}

function deleteAvatar() {
    console.log(document.getElementById("avatar-img").src);
    console.log(toAbsURL(originAvatar));
    if (document.getElementById("avatar-img").src == toAbsURL(originAvatar)) {
        if (confirm("确定要删除并恢复至默认头像吗？")) {
            useDefault = true;
            document.getElementById("customFile").value = '';
            document.getElementById("avatar-img").src = defaultAvatar;
        }
    } else {
        useDefault = false;
        document.getElementById("avatar-img").src = originAvatar
        document.getElementById("customFile").value = '';
    }
}

function showAvatar() {
    useDefault = false;
    var fileInput = document.getElementById("customFile");
    var file = fileInput.files[0];
    if (file) {
        // Display the selected image
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            document.getElementById("avatar-img").src = e.target.result;
        };
    }
}

function submitAvatar() {
    if (useDefault) {
        var formData = new FormData();
        formData.append("use_default", 'true');
        $.ajax({
            url: updateAvatarUrl,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                location.reload();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("出现错误，请重试！");
            }
        });
    } else {
        var fileInput = document.getElementById("customFile");
        var file = fileInput.files[0];
        var formData = new FormData();
        formData.append("usedefault", 'false');
        formData.append("avatar", file);
        $.ajax({
            url: updateAvatarUrl,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                location.reload();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("出现错误，请重试！");
            }
        });
    }
}


function checkPassword() {
    var oldpwd = $('#old_pwd').val();
    var pwd = $('#new_pwd').val();
    var repwd = $('#re_pwd').val();
    if (pwd == repwd) {
        $('#pwd_notice').text('');
        if (oldpwd !== '' && pwd !== '') {
            $('#pwd_submit').prop('disabled', false);
        } else {
            $('#pwd_submit').prop('disabled', true);
        }
    } else {
        $('#pwd_notice').text('密码不一致！');
        $('#pwd_submit').prop('disabled', true);
    }
}


function updatePassword() {
    var old_pwd = $('#old_pwd').val();
    var new_pwd = $('#new_pwd').val();
    $.ajax({
        url: updatePwdUrl,
        method: "POST",
        data: {
            old_pwd: old_pwd,
            new_pwd: new_pwd
        },
        dataType: 'json',
        success: function (response) {
            if (response['success'] == 'true') {
                alert("密码修改成功，请重新登陆！");
                location.reload();
            } else {
                $('#pwd_notice').text(response['errors']);
                $('#pwd_notice').removeClass('text-success').addClass('text-danger');
            }
        },
        error: function (xhr, status, error) {
            var response = JSON.parse(xhr.responseText);
            alert(response['errors']);
        }
    });
}

function updateInfo() {
    var name = $('#name').val();
    var gender = $('#gender').val();
    var birthday = $('#birthday').val();
    var username = $('#username').val();
    var email = $('#email').val();
    $.ajax({
        url: apiUrl,
        method: "POST",
        data: {
            name: name,
            gender: gender,
            birthday: birthday,
            username: username,
            email: email
        },
        dataType: 'json',
        success: function (response) {
            alert("用户信息修改成功！");
            location.reload();
        },
        error: function (xhr, status, error) {
            var response = JSON.parse(xhr.responseText);
            $('#info_notice').text(response['errors']);
            $('#info_notice').removeClass('text-success').addClass('text-danger');
        }
    });
}

function checkEmail() {
    var email = $('#email').val();
    if ((!email.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)) && !(email == '')) {
        $('#info_notice').text('邮箱地址不合法！');
        $('#info_notice').removeClass('text-success').addClass('text-danger');
    } else {
        $('#info_notice').text('');
    }
}