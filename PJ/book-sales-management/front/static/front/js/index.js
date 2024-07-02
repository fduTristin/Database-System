Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const month_label = months.slice(0, currentMonth + 1);
let monthlyData = {};

function loadData() {
    $.ajax({
        url: indexData,
        async: false,
        success: function (response) {
            monthlyData = response;
            const len = response.income.length;
            $('#orderCount').text(response.count);
            $('#totalAmount').text("￥" + (response.income[len - 1] - response.expend[len - 1]).toFixed(2));
            $('#monthlyIncome').text("￥" + response.income[len - 1]);
            $('#monthlyExpend').text("￥" + response.expend[len - 1]);
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

$(document).ready(function () {
    //获得数据
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
    //如果数据为空，显示灰色
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