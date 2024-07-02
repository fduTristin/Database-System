var orders;
const itemsPerPage = 20;
let currentPage = 1;

const status_map = {
    '-1': [['danger', '错误'], ['错误', '订单被标记为错误状态'], []],
    0: [['warning', '等待付款'], ['创建订单', '订单成功创建，等待付款'], [['取消订单', 1]]],
    1: [['info', '等待物流'], ['付款完成', '财务款项已确认'], [['发起退货申请', 2], ['完成订单', 3]]],
    2: [['danger', '收到退款申请'], ['退货申请', '发起退货申请'], [['退货商品入库', 5], ['取消退货申请', 6]]],
    3: [['primary', '收到退款货物'], ['退货入库', '退货订单已收到并入库'], []],
    4: [['success', '已完成'], ['订单完成', '交易完成'], []],
    5: [['secondary', '已退款'], ['退款完成', '退款已到账，订单关闭'], []],
    6: [['secondary', '已关闭'], ['订单关闭', '订单已关闭'], []]
};

const confirm_sentence = {
    1: ['取消订单', '确认取消该订单吗？'],
    2: ['退货申请', '该订单是销售订单，请先确认收到了客户的退货申请'],
    3: ['完成订单', '确认将此订单设为已完成吗？'],
    4: ['商品入库', '请确认收到了全部货物，在左侧填写入库位置并完成入库'],
    5: ['退货商品入库', '请清点并检查客户的退货货物，在左侧填写入库位置并完成入库'],
    6: ['取消退货申请', '确认要取消退货申请吗？订单状态将被设为“完成”']
}

function loadOrders() {
    $.ajax({
        url: orderApi,
        success: function (response) {
            orders = response.data;
            totalPages = Math.ceil(response.data.length / itemsPerPage);
            renderOrders(response.data);
            $('#pendingCount').text(response.pending);
            $('#totalCount').text(response.total);
            $('#monthlyIncome').text(response.income);
            $('#monthlyExpend').text(response.expend);
            // renderPaginationLinks();
        },
        error: function (response) {
            alert("加载失败！");
        }
    });
}

function renderOrders(orders) {
    var startIndex = (currentPage - 1) * itemsPerPage;
    var endIndex = startIndex + itemsPerPage;
    var ordersHtml = '';
    for (var i = startIndex; i < endIndex && i < orders.length; i++) {
        var order = orders[i];
        var bookImg = order.items.first;
        if (order.order_type == 0) {
            ordersHtml += `<tr><td class="text-center" style="vertical-align: middle"><i class="fa-solid fa-arrow-right-to-bracket fa-2x fa-lg text-dark pe-2"></i>&nbsp;&nbsp;进货</td>`;
        } else {
            ordersHtml += `<tr><td class="text-center" style="vertical-align: middle"><i class="fa-solid fa-arrow-right-from-bracket fa-2x fa-lg text-dark pe-2"></i>&nbsp;销售</td>`;
        }
        if (order.items.count > 1) {
            ordersHtml += `<td class="text-center" style="vertical-align: middle" onclick="renderOrderDetail(${order.order_id})">${order.order_id}</td>
                       <td onclick="renderOrderDetail(${order.order_id})"><img src="${bookImg}" width='100' height='100'/>  共${order.items.count}种</td>`;
        } else {
            ordersHtml += `<td class="text-center" style="vertical-align: middle" onclick="renderOrderDetail(${order.order_id})">${order.order_id}</td>
                       <td onclick="renderOrderDetail(${order.order_id})"><img src="${bookImg}" width='100' height='100'/></td>`;
        }
        ordersHtml += `<td style="display: table-cell; vertical-align: middle; text-align: center" onclick="renderOrderDetail(${order.order_id})"><span class="badge badge-${status_map[order.status][0][0]}">${status_map[order.status][0][1]}</span></td>
                       <td class="text-center" style="vertical-align: middle" onclick="renderOrderDetail(${order.order_id})">￥${order.amount}</td>
                       <td class="text-center" style="vertical-align: middle" onclick="renderOrderDetail(${order.order_id})">${order.create_time}</td>
                       <td style="display: table-cell; vertical-align: middle; text-align: center">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          更多操作
                        </a>
                        <div class="dropdown-menu dropdown-menu-right animated--fade-in" aria-labelledby="navbarDropdown">
                        <a class="dropdown-item" onclick="renderOrderDetail(${order.order_id})">详细信息</a>`;
        if (order.status < 3 && order.status != -1) {
            ordersHtml += `<div class="dropdown-divider"></div>`;
            if (order.order_type === 0 && order.status === 1) {
                ordersHtml += `<a class="dropdown-item" onclick="renderOrderDetail(${order.order_id},4)">商品入库</a>`;
            } else {
                for (var j = 0; j < status_map[order.status][2].length; j++) {
                    ordersHtml += `<a class="dropdown-item" onclick="renderOrderDetail(${order.order_id},${status_map[order.status][2][j][1]})">${status_map[order.status][2][j][0]}</a>`;
                }
            }
        }
        ordersHtml += `</div></td></tr>`
    }
    $('#orders_tbody').html(ordersHtml);
}

function renderOrderDetail(order_id, type = 0) {
    var orderDetails;
    var orderItems;
    var orderStatus;
    $.ajax({
        url: orderDetailApi,
        async: false,
        data: {'order_id': order_id},
        success: function (response) {
            orderDetails = response.data;
        }
    });
    $.ajax({
        url: orderItemsApi,
        async: false,
        data: {'order_id': order_id},
        success: function (response) {
            orderItems = response.data;
        }
    });
    $.ajax({
        url: orderStatusApi,
        async: false,
        data: {'order_id': order_id},
        success: function (response) {
            orderStatus = response.data;
        }
    });
    orderStatus.sort(function (a, b) {
        var dateA = new Date(a.time);
        var dateB = new Date(b.time);
        return dateA - dateB;
    });

    var infoHtml = `<p><strong>订单编号:</strong> #${orderDetails.order_id}</p>`;
    if (orderDetails.order_type == 1) {
        infoHtml += `<p><strong>订单类型:</strong> 销售订单</p>
                     <p><strong>顾客信息:</strong> ${orderDetails.customer}</p>`;
    } else {
        infoHtml += `<p><strong>订单类型:</strong> 进货订单</p>`;
    }
    infoHtml += `<p><strong>订单备注:</strong> ${orderDetails.note}</p>`;
    $('#order-info').html(infoHtml);

    var itemsHtml = ``;
    for (var i = 0; i < orderItems.length; i++) {
        var item = orderItems[i];
        itemsHtml += `<tr>
                                      <td><img src="${item.img}" class="img-fluid" width="50"></td>
                                      <td>${item.bookname}</td>`;
        if (type > 3) {
            itemsHtml += `<td><input type="text" class="form-control" id="loc-${item.book_id}" value="${item.inventory_location != null ? item.inventory_location : ""}"></td>`
        } else {
            itemsHtml += `<td>${item.inventory_location != null ? item.inventory_location : "-"}</td>`
        }
        itemsHtml += `<td>${item.quantity}</td>
                      <td>￥${item.price}</td>
                      </tr>`;
    }
    $('#items').html(itemsHtml);

    $('#amount').html(`<p><strong>总价:</strong> ￥${orderDetails.amount}</p>`);

    var timelineHtml = ``;
    for (var i = 0; i < orderStatus.length; i++) {
        var status = orderStatus[i];
        timelineHtml += `<li>
                                        <p><strong>${status_map[status.status][1][0]}:</strong> ${status.time}</p>
                                        <p>${status_map[status.status][1][1]}-<i>${status.name}(${status.username})</i></p>
                                    </li>`;
    }
    if (type !== 0) {
        timelineHtml += `<hr>
                         <p><strong>${confirm_sentence[type][0]}:</strong></p>
                         <p>${confirm_sentence[type][1]}</p>
                         <button type="button" class="btn btn-warning" onclick="updateOrderStatus(${order_id},${type})" ">确定</button>`;
    }
    $('#timeline').html(timelineHtml);
    $('#orderDetailsModal').modal('show');
}

function filterOrders() {
    var showExpenditure = $('#showExpenditure').prop('checked');
    var showIncome = $('#showIncome').prop('checked');
    var showPending = $('#showPending').prop('checked');
    var ordersToShow = [];
    if (showExpenditure) {
        ordersToShow = ordersToShow.concat(orders.filter(order => order.order_type == 0));
    }
    if (showIncome) {
        ordersToShow = ordersToShow.concat(orders.filter(order => order.order_type == 1));
    }
    if (showPending) {
        ordersToShow = ordersToShow.filter(order => order.status < 3);
    }
    renderOrders(ordersToShow);
}

function updateOrderStatus(order_id, type) {
    var location = {};
    if (type > 3) {
        var inputs = document.querySelectorAll("[id^='loc-']");
        var isEmpty = false;
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].value.trim() === "") {
                isEmpty = true;
                break;
            }
        }
        if (isEmpty) {
            alert("请填写所有的库存位置");
            return;
        } else {
            for (var i = 0; i < inputs.length; i++) {
                location[inputs[i].id.match(/\d+/)[0]] = inputs[i].value;
            }
        }
    }
    var newStatus = {'order_id': order_id, 'type': type, 'location': location};
    $.ajax({
        url: updateOrderStatusApi,
        method: 'POST',
        data: JSON.stringify(newStatus),
        success: function (response) {
            window.location.reload();
        },
        error: function (response) {
            alert("更新订单状态失败！");
        },
    });
}

$(document).ready(function () {
    loadOrders();
});