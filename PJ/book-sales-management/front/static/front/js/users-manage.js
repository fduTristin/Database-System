$(document).ready(function () {
    var columnDefs = [
        {
            data: "work_id",
            title: "工号",
            type: "readonly"
        },
        {
            data: "username",
            title: "用户名"
        },
        {
            data: "name",
            title: "姓名"
        },
        {
            data: "gender",
            title: "性别",
            type: 'select',
            options: ['男', '女']
        },
        {
            data: "age",
            title: "年龄",
            type: "readonly"
        },
        {
            data: 'birthday',
            title: '出生日期',
            datetimepicker: {timepicker: false, format: "Y-m-d"},
            editorOnChange: function (event, altEditor) {
                let currentDate = new Date();
                let currentYear = currentDate.getFullYear();
                let birthYear = $(event.currentTarget).val().substring(0, 4);
                $(altEditor.modal_selector).find("#age").attr('placeholder', currentYear - birthYear);
            }
        },
        {
            data: "password",
            title: "密码"
        },
        {
            data: "type",
            title: "账户类型",
            type: 'select',
            options: ['超级管理员', '普通员工', '用户']
        },
        {
            data: "email",
            title: "电子邮箱",
        },
        {
            data: "last_login",
            title: "上次登录时间",
            type: "readonly"
        },
        {
            data: "date_joined",
            title: "注册时间",
            type: "readonly"
        },
    ];


    function invalidEmail() {
        var message = '<div class="alert alert-danger" role="alert">' +
            '<strong>' + 'Error!' + '</strong>'
            + '<br />电子邮箱格式有误！' +
            '</div>';
        $('#altEditor-modal-22 .modal-body').append(message);

    }

    var myTable = $('#dataTable').DataTable({
        ajax: {
            url: ajax_url,
            dataSrc: 'data'
        },
        columns: columnDefs,
        dom: "<'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-center text-center'B>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        select: 'single',
        responsive: true,
        altEditor: true,
        buttons: [
            {
                text: '添加',
                name: 'add'
            },
            {
                extend: 'selected',
                text: '编辑',
                name: 'edit'
            },
            {
                extend: 'selected',
                text: '删除',
                name: 'delete'
            },
            {
                text: '刷新',
                name: 'refresh'
            }
        ],
        onAddRow: function (datatable, rowdata, success, error) {
            if ((!rowdata['email'].match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)) && !(rowdata['email'] == '') && !(rowdata['email'] == '-')) {
                invalidEmail();
            } else {
                rowdata['email'] = rowdata['email'] === '-' ? '' : rowdata['email'];
                $.ajax({
                    url: ajax_url,
                    type: 'PUT',
                    data: rowdata,
                    success: success,
                    error: error
                })
            }
        },
        onDeleteRow: function (datatable, rowdata, success, error) {
            $.ajax({
                url: ajax_url,
                type: 'POST',
                data: {request_type: 'delete', work_id: rowdata[0]['work_id']},
                success: success,
                error: error
            });
        },
        onEditRow: function (datatable, rowdata, success, error) {
            if ((!rowdata['email'].match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)) && !(rowdata['email'] == '') && !(rowdata['email'] == '-')) {
                invalidEmail();
            } else {
                rowdata['email'] = rowdata['email'] === '-' ? '' : rowdata['email'];
                $.ajax({
                    url: ajax_url,
                    type: 'POST',
                    data: Object.assign({}, {request_type: 'edit'}, rowdata),
                    success: success,
                    error: error
                });
            }
        }
    });
});
