$(document).ready(function() {
    var columnDefs = [
        {
            data: "img",
            title: "封面",
            render: function (data, type, row, meta) {
                if (data) return `<img style='max-width:100px;max-height:100px' src='${data}'></img>`;
            },
            type: "readonly"
        },
        {
            name: "image",
            data: "new_image",
            render: function (data, type, row, meta) {
                return "-";
            },
            type: "file",
            title: "上传封面",
            visible: false,
            accept: "image/*"
        },
        {
            data: "book_id",
            title: "图书编号",
            type: "readonly"
        },
        {
            data: "ISBN",
            title: "ISBN"
        },
        {
            data: "bookname",
            title: "书名"
        },
        {
        data: "author",
        title: "作者"
        },
        {
        data: "publisher",
        title: "出版社"
        },
        {
        data: "retail_price",
        title: "零售价"
        },
        {
            data: "genre",
            title: "内容体裁"
        },
        {
            data: "format",
            title: "书籍格式"
        }
    ];

    function invalidPrice() {
        var message = '<div class="alert alert-danger" role="alert">' +
            '<strong>' + 'Error!' + '</strong>'
            + '<br />零售价必须为数字！' +
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
        buttons: [],
        onAddRow: function(datatable, rowdata, success, error) {
            if (!rowdata['retail_price'].match(/^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/)) {
                invalidPrice();
            } else {
                if (!rowdata.hasOwnProperty('new_image')) {
                    rowdata['new_image'] = '';
                }
                $.ajax({
                    url: ajax_url,
                    type: 'PUT',
                    data: rowdata,
                    success: success,
                    error: error
                });
            }
        },
        onDeleteRow: function(datatable, rowdata, success, error) {
            $.ajax({
                url: ajax_url,
                type: 'POST',
                data: {request_type: 'delete', book_id: rowdata[0]['book_id']},
                success: success,
                error: error
            });
        },
        onEditRow: function(datatable, rowdata, success, error) {
            if (!rowdata['retail_price'].match(/^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/)) {
                invalidPrice();
            } else {
                if (!rowdata.hasOwnProperty('new_image')) {
                    rowdata['new_image'] = '';
                }
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
