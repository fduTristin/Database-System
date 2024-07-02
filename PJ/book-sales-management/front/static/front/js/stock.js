$(document).ready(function () {
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
            data: "stock_id",
            title: "库存编号",
            type: "readonly"
        },
        {
            data: "book_id",
            title: "图书编号",
            type: "readonly"
        },
        {
            data: "bookname",
            title: "书名",
            type: "readonly"
        },
        {
            data: "ISBN",
            title: "ISBN",
            type: "readonly"
        },
        {
            data: "count",
            title: "库存数量",
            type: "readonly"
        },
        {
            data: "inventory_location",
            title: "库存位置",
        },
        {
            data: "author",
            title: "作者",
            type: "readonly"
        },
        {
            data: "publisher",
            title: "出版社",
            type: "readonly"
        },
        {
            data: "genre",
            title: "内容体裁",
            type: "readonly"
        },
        {
            data: "format",
            title: "书籍格式",
            type: "readonly"
        }
    ];


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
                extend: 'selected',
                text: '编辑',
                name: 'edit'
            },
            {
                text: '刷新',
                name: 'refresh'
            }
        ],
        onEditRow: function (datatable, rowdata, success, error) {
            $.ajax({
                url: ajax_url,
                type: 'POST',
                data: {'stock_id': rowdata.stock_id, 'new_location': rowdata.inventory_location},
                success: success,
                error: error
            });
        }
    });
});
