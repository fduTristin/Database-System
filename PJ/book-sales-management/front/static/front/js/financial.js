var orders;
var sortedOrders = [];
var sorted = false;
const itemsPerPage = 20;
let currentPage = 1;

const status_map = {
    0: [{0: ['danger', '等待支付货款'], 1: ['primary', '货款已支付']}, '支付货款'],
    1: [{0: ['warning', '等待接受货款'], 1: ['info', '货款已收到']}, '收到货款'],
    2: [{0: ['danger', '等待支付退款'], 1: ['primary', '退款已支付']}, '支付退款']
}
const confirm_sentence = {
    0: ['支付款项', '该订单是进货订单，将要支付货款'],
    1: ['收款确认', '该订单是销售订单，请确认收到了客户的货款'],
    2: ['支付退款', '该订单是退货订单，将要支付退款']
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
            $('#monthlyIncome').text("￥" + response.income);
            $('#monthlyExpend').text("￥" + response.expend);
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
        if (order.fin_type == 1) {
            ordersHtml += `<tr><td class="text-center" style="vertical-align: middle"><i class="fa-solid fa-arrow-right-to-bracket fa-2x fa-lg text-dark pe-2"></i>&nbsp;&nbsp;收入</td>`;
        } else {
            ordersHtml += `<tr><td class="text-center" style="vertical-align: middle"><i class="fa-solid fa-arrow-right-from-bracket fa-2x fa-lg text-dark pe-2"></i>&nbsp;支出</td>`;
        }
        ordersHtml += `<td className="text-center" style="vertical-align: middle" onClick="renderOrderDetail(${order.fin_id},${order.order_id})">${order.fin_id}</td>
                       <td className="text-center" style="vertical-align: middle" onClick="renderOrderDetail(${order.fin_id},${order.order_id})">${order.order_id}</td>`;
        if (order.fin_status == 2) {
            ordersHtml += `<td style="display: table-cell; vertical-align: middle; text-align: center" onclick="renderOrderDetail(${order.fin_id},${order.order_id})">
                           <span class="badge badge-secondary">已关闭</span></td>`;
        } else {
            ordersHtml += `<td style="display: table-cell; vertical-align: middle; text-align: center" onclick="renderOrderDetail(${order.fin_id},${order.order_id})">
                           <span class="badge badge-${status_map[order.fin_type][0][order.fin_status][0]}">${status_map[order.fin_type][0][order.fin_status][1]}</span></td>`;
        }
        ordersHtml += `<td class="text-center" style="vertical-align: middle" onclick="renderOrderDetail(${order.fin_id},${order.order_id})">￥${order.amount}</td>
                       <td class="text-center" style="vertical-align: middle" onclick="renderOrderDetail(${order.fin_id},${order.order_id})">${order.create_time}</td>
                       <td style="display: table-cell; vertical-align: middle; text-align: center">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          更多操作
                        </a>
                        <div class="dropdown-menu dropdown-menu-right animated--fade-in" aria-labelledby="navbarDropdown">
                        <a class="dropdown-item" onclick="renderOrderDetail(${order.fin_id},${order.order_id})">详细信息</a>`;
        if (order.fin_status == 0) {
            ordersHtml += `<div class="dropdown-divider"></div>
                           <a class="dropdown-item" onclick="renderOrderDetail(${order.fin_id},${order.order_id},${order.fin_type})">${status_map[order.fin_type][1]}</a>`;
        }
        ordersHtml += `</div></td></tr>`
    }
    $('#orders_tbody').html(ordersHtml);
}

function renderOrderDetail(fin_id, order_id, type = -1) {
    let order = orders.filter(order => order.fin_id === fin_id)[0];
    let orderItems;
    $.ajax({
        url: orderItemsApi,
        async: false,
        data: {'order_id': order_id},
        success: function (response) {
            orderItems = response.data;
        }
    });
    let infoHtml = `<p><strong>订单编号:</strong> #${order_id}</p>`;
    if (order.fin_type === 1) {
        infoHtml += `<p><strong>订单类型:</strong> 销售订单</p>`;
    } else {
        infoHtml += `<p><strong>订单类型:</strong> 进货订单</p>`;
    }
    $('#order-info').html(infoHtml);

    let itemsHtml = ``;
    for (let i = 0; i < orderItems.length; i++) {
        let item = orderItems[i];
        itemsHtml += `<tr><td><img src="${item.img}" class="img-fluid" width="50"></td>
                      <td>${item.bookname}</td>`;
        itemsHtml += `<td>${item.quantity}</td>
                      <td>￥${item.price}</td>
                      </tr>`;
    }
    $('#items').html(itemsHtml);

    $('#amount').html(`<p><strong>总价:</strong> ￥${order.amount}</p>`);

    let timelineHtml = ``;
    timelineHtml += `<li><p><strong>${status_map[order.fin_type][0][0][1]}:</strong> ${order.create_time}</p>
                     <p><i>${order.create_name}(${order.create_username})</i></p></li>`;
    console.log(order.fin_id);
    console.log(order.fin_status);
    if (order.fin_status === 1) {
        timelineHtml += `<li><p><strong>${status_map[order.fin_type][0][order.fin_status][1]}:</strong> ${order.processed_time}</p>
                     <p><i>${order.process_name}(${order.process_username})</i></p></li>`;
    } else if (order.fin_status === 2) {
        timelineHtml += `<li><p><strong>已关闭:</strong> ${order.process_time}</p>
                     <p><i>${order.process_name}(${order.process_username})</i></p></li>`;
    }
    if (type !== -1) {
        timelineHtml += `<hr>
                         <p><strong>${confirm_sentence[type][0]}:</strong></p>
                         <p>${confirm_sentence[type][1]}${order.amount}元！</p>
                         <button type="button" class="btn btn-warning" onclick="updateOrderStatus(${fin_id},${type})" ">确定</button>`;
    }
    $('#timeline').html(timelineHtml);
    $('#orderDetailsModal').modal('show');
}

function filterOrders() {
    let showExpenditure = $('#showExpenditure').prop('checked');
    let showIncome = $('#showIncome').prop('checked');
    let showPending = $('#showPending').prop('checked');
    let ordersToShow = [];
    if (showExpenditure) {
        ordersToShow = ordersToShow.concat(orders.filter(order => order.fin_type != 2));
    }
    if (showIncome) {
        ordersToShow = ordersToShow.concat(orders.filter(order => order.fin_type == 2));
    }
    if (showPending) {
        ordersToShow = ordersToShow.filter(order => order.fin_status == 0);
    }
    renderOrders(ordersToShow);
}

function updateOrderStatus(fin_id, type) {
    let newStatus = {'fin_id': fin_id, 'type': type};
    $.ajax({
        url: updateOrderStatusApi,
        method: 'POST',
        data: JSON.stringify(newStatus),
        success: function (response) {
            window.location.reload();
        },
        error: function (response) {
            alert("更新流水状态失败！");
        },
    });
}

$(document).ready(function () {
    loadOrders();
});