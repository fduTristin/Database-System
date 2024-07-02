Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const month_label = months.slice(0, currentMonth + 1);
let monthlyData = {};

function loadData() {
    $.ajax({
        url: monthlyApi,
        async: false,
        success: function (response) {
            monthlyData = response;
        },
        error: function (response) {
            alert("加载失败！");
        }
    });
}

function number_format(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(',', '').replace(' ', '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

function updateSummary(startDate, endDate) {
    $.ajax({
        url: summaryApi,
        method: 'POST',
        async: false,
        data: {'start': startDate, 'end': endDate},
        success: function (response) {
            let summaryData = response;
            let inner = `<p><strong>进货支出</strong></p>
<p>单数: <span>${Number(summaryData[0]['count'])}</span></p>
<p>总价: <span>￥${summaryData[0]['sum'].toFixed(2)}</span></p>
<p>均价: <span>￥${summaryData[0]['avg'].toFixed(2)}</span></p>`;
            $('#purchase-summary').html(inner);
            inner = `<p><strong>退款支出</strong></p>
<p>单数: <span>${Number(summaryData[2]['count'])}</span></p>
<p>总价: <span>￥${summaryData[2]['sum'].toFixed(2)}</span></p>
<p>均价: <span>￥${summaryData[2]['avg'].toFixed(2)}</span></p>`;
            $('#refund-summary').html(inner);
            inner = `<p><strong>销售收入</strong></p>
<p>单数: <span>${Number(summaryData[1]['count'])}</span></p>
<p>总价: <span>￥${summaryData[1]['sum'].toFixed(2)}</span></p>
<p>均价: <span>￥${summaryData[1]['avg'].toFixed(2)}</span></p>`;
            $('#sales-summary').html(inner);
            inner = `<p><span><strong>总收入:&nbsp;&nbsp;</strong></span><span>￥${summaryData['income'].toFixed(2)}</span></p>
<p><span><strong>总支出:&nbsp;&nbsp;</strong></span><span>￥${summaryData['expend'].toFixed(2)}</span></p>
<hr>
<p><span><strong>盈亏:&nbsp;&nbsp;&nbsp;</strong></span><span>￥${summaryData['total'].toFixed(2)}</span></p>`;
            $('#total-summary').html(inner);
        },
        error: function (response) {
            alert("加载失败！");
        }
    });
}

$(document).ready(function () {
    // 初始化两个日期选择框
    var $startDateInput = $('#start-date');
    var $endDateInput = $('#end-date');
    $startDateInput.datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true
    });
    $endDateInput.datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true
    });
    // 初始化日期
    const today = new Date();
    let initialStartDate = new Date(today.getFullYear(), 0, 1);
    let initialEndDate = today;
    $startDateInput.datepicker('setDate', initialStartDate);
    $endDateInput.datepicker('setDate', initialEndDate);
    //获得统计信息
    updateSummary(initialStartDate.toLocaleDateString(), initialEndDate.toLocaleDateString());
    //触发判断，如果修改了日期，就获得新日期的统计信息
    $startDateInput.on('change', validateDates);
    $endDateInput.on('change', validateDates);

    function validateDates() {
        let startDate = new Date($startDateInput.val());
        let endDate = new Date($endDateInput.val());

        if (endDate < startDate) {
            alert('结束日期必须晚于开始日期');
            $startDateInput.datepicker('setDate', initialStartDate);
            $startDateInput.datepicker('setDate', initialStartDate);
        } else {
            initialStartDate = startDate;
            initialEndDate = endDate;
            updateSummary(startDate.toLocaleDateString(), endDate.toLocaleDateString());
        }
    }

    //获得上半部分的统计信息
    loadData();
    //渲染曲线图
    let ctx = document.getElementById("myAreaChart");
    let myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: month_label,
            datasets: [{
                label: "收款",
                lineTension: 0.3,
                backgroundColor: "rgba(78, 115, 223, 0.05)",
                borderColor: "rgba(78, 115, 223, 1)",
                pointRadius: 3,
                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                pointBorderColor: "rgba(78, 115, 223, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: monthlyData['income'],
            },
                {
                    label: "付款",
                    lineTension: 0.3,
                    backgroundColor: "rgba(255, 99, 132, 0.05)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    pointRadius: 3,
                    pointBackgroundColor: "rgba(255, 99, 132, 1)",
                    pointBorderColor: "rgba(255, 99, 132, 1)",
                    pointHoverRadius: 3,
                    pointHoverBackgroundColor: "rgba(255, 99, 132, 1)",
                    pointHoverBorderColor: "rgba(255, 99, 132, 1)",
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    data: monthlyData['expend'],
                }],
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                }],
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10,
                        callback: function (value, index, values) {
                            return '￥' + number_format(value);
                        }
                    },
                    gridLines: {
                        color: "rgb(234, 236, 244)",
                        zeroLineColor: "rgb(234, 236, 244)",
                        drawBorder: false,
                        borderDash: [2],
                        zeroLineBorderDash: [2]
                    }
                }],
            },
            legend: {
                display: false
            },
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                titleMarginBottom: 10,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 10,
                callbacks: {
                    label: function (tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': ￥' + number_format(tooltipItem.yLabel);
                    }
                }
            }
        }
    });
    //渲染饼形图
    ctx = document.getElementById("myPieChart");
    let pie_data = [monthlyData['purchase_t'], monthlyData['refund_t'], monthlyData['income_t'], 0];
    //如果没有数据，用灰色填充
    if (monthlyData['purchase_t'] === 0 && monthlyData['refund_t'] === 0 && monthlyData['income_t'] === 0) {
        pie_data = [0, 0, 0, 1];
    }
    let myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ["进货支出", "退货支出", "销售收入", "无数据"],
            datasets: [{
                data: pie_data,
                backgroundColor: ['#ff6464', '#fa9a6b', '#4E73DF', '#898989'],
                hoverBackgroundColor: ['#e44343', '#f98146', '#2351d7', '#7b7b7b'],
                hoverBorderColor: "rgba(234, 236, 244, 1)",
            }],
        },
        options: {
            maintainAspectRatio: false,
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                caretPadding: 10,
            },
            legend: {
                display: false
            },
            cutoutPercentage: 80,
        },
    });
});