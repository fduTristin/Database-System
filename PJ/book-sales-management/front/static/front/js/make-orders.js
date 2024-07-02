var books;
var booksInStock;
var booksToRender;
const itemsPerPage = 6;
let currentPage = 1;
var totalPages;
var selectedBookId;
var selectedBook;
var selectedBooks = {};
var totalPrice = 0;
var otherPrice = 0;
var itemPrice = 0;
var orderType = 0; //0:进货 1:销售

function loadBooks() {
    $.ajax({
        url: stock_url,
        async: false,
        success: function (response) {
            books = response.data;
            totalPages = Math.ceil(response.data.length / itemsPerPage);
            booksToRender = books;
            renderBookImages();
            renderPaginationLinks();
            booksInStock = books.filter(book => book.count >= 1);
        }
    });
}

function renderBookImages() {
    totalPages = Math.ceil(booksToRender.length / itemsPerPage);
    var startIndex = (currentPage - 1) * itemsPerPage;
    var endIndex = startIndex + itemsPerPage;
    var bookImagesHtml = ``;
    for (var i = startIndex; i < endIndex && i < booksToRender.length; i++) {
        var book = booksToRender[i];
        bookImagesHtml += `<div class="col-4 mb-3">
                            <div class="card h-100 book-image" data-book-id="${book.book_id}"><img src="${book.img}"
                                                                                              class="card-img-top"
                                                                                              alt="${book.bookname}"></img>
                                <div class="card-body"><p class="card-text">${book.bookname}</p></div></div>
                        </div>`
        ;
    }
    $('#book-image-container').html(bookImagesHtml);
}

function renderPaginationLinks() {
    var paginationHtml = '';
    var maxVisiblePages = 5;
    var numLinksToShow = Math.min(totalPages, maxVisiblePages);

    if (totalPages > 1) {
        var prevDisabled = currentPage == 1 ? ' disabled' : '';
        var nextDisabled = currentPage == totalPages ? ' disabled' : '';
        paginationHtml += `
            <li class="page-item${prevDisabled}">
            <a class="page-link${prevDisabled}" href="#" aria-label="Previous" data-direction="prev">
            <span aria-hidden="true">«</span>
            <span class="sr-only">Previous</span>
            </a>
            </li>`;
        if (currentPage > Math.floor(maxVisiblePages / 2) + 1) {
            paginationHtml += `
                <li class="page-item">
                <a class="page-link" href="#" data-page="1">1</a>
                </li>
                <li class="page-item disabled">
                <a class="page-link" href="#">...</a>
                </li>`;
        }
        var startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        var endPage = Math.min(startPage + numLinksToShow - 1, totalPages);
        for (var i = startPage; i <= endPage; i++) {
            var active = i == currentPage ? ' active' : '';
            paginationHtml += `
                <li class="page-item${active}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>`;
        }
        if (currentPage < totalPages - Math.floor(maxVisiblePages / 2) && endPage !== totalPages) {
            paginationHtml += `
                <li class="page-item disabled">
                <a class="page-link" href="#">...</a>
                </li>
                <li class="page-item">
                <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
                </li>`;
        }
        paginationHtml += `
            <li class="page-item${nextDisabled}">
            <a class="page-link${nextDisabled}" href="#" aria-label="Next" data-direction="next">
            <span aria-hidden="true">»</span>
            <span class="sr-only">Next</span>
            </a>
            </li>`;
    }
    $('#pagination-container').html(paginationHtml);
}

function filterBooks() {
    var searchTerm = $('#book-search').val().toLowerCase();
    if (orderType === 1) {
        var filteredBooks = booksInStock.filter(function (book) {
            return book.bookname.toLowerCase().includes(searchTerm);
        });
    } else {
        var filteredBooks = books.filter(function (book) {
            return book.bookname.toLowerCase().includes(searchTerm);
        });
    }
    booksToRender = filteredBooks;
    currentPage = 1;
    renderBookImages();
    renderPaginationLinks();
}

function selectBook() {
    selectedBooks[selectedBookId] = [1, parseFloat(selectedBook.retail_price)];
    bookHtml = $('#books-list').html();
    bookHtml += `<tr>
                            <th scope="row">
                                <div class="d-flex align-items-center">
                                    <img src="${selectedBook.img}" class="img-fluid rounded-3"
                                         style="width: 120px;" alt="Book">
                                    <div class="flex-column ms-4">
                                        <p class="mb-2">${selectedBook.bookname}</p>
                                        <p class="mb-0">${selectedBook.author}</p>
                                    </div>
                                </div>
                            </th>
                            <td class="align-middle">
                                <p class="mb-0" style="font-weight: 500;">${selectedBook.format}</p>
                            </td>
                            <td class="align-middle">
                                <p class="mb-0" style="font-weight: 500;">${selectedBook.count}</p>
                            </td>
                            <td class="align-middle">
                                <div class="d-flex flex-row" data-book-id="${selectedBookId}">
                                    <button class="btn btn-link px-2"
                                            onclick="this.parentNode.querySelector('input[type=number]').stepDown();this.parentNode.querySelector('input[type=number]').setAttribute('value',this.parentNode.querySelector('input[type=number]').value);changeQuantity(this.parentNode);">
                                        <i class="fas fa-minus"></i>
                                    </button>

                                    <input id min="0" name="quantity" value="1" type="number"
                                           class="form-control form-control-sm" style="width: 50px;" onchange="changeQuantity(this.parentNode)"/>

                                    <button class="btn btn-link px-2"
                                            onclick="this.parentNode.querySelector('input[type=number]').stepUp();this.parentNode.querySelector('input[type=number]').setAttribute('value',this.parentNode.querySelector('input[type=number]').value);changeQuantity(this.parentNode);">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </td>`;
    if (orderType === 1) {
        bookHtml += `<td class="align-middle">
                                <p class="mb-0" style="font-weight: 500;">${selectedBook.retail_price}</p>
                            </td>
                        </tr>`;
    } else {
        bookHtml += `<td class="align-middle" data-book-id="${selectedBookId}">
                                <input min="0" name="purchase_price" type="number" min="0.01" value="${selectedBook.retail_price}"
                                           class="form-control form-control-sm" style="width: 50px;" onchange="changePurchasePrice(this.parentNode)"/>
                            </td>
                        </tr>`;
    }

    $('#books-list').html(bookHtml);
    $('#confirm-book-modal').modal('hide');
    $('#confirm-button').attr("disabled", "disabled");
    updatePrice()
}

function changeQuantity(n) {
    var quantity = parseInt(n.querySelector('input[type=number]').value);
    var id = n.getAttribute("data-book-id");
    var max_count = books.filter(book => book.book_id == id)[0].count;
    if (quantity == 0) {
        if (confirm("要删除这本书吗？")) {
            var trNode = n.parentNode.parentNode;
            trNode.remove();
            delete selectedBooks[id];
        }
    } else if (quantity > max_count && orderType === 1) {
        n.querySelector('input[type=number]').value = max_count;
        selectedBooks[id][0] = max_count;
    } else {
        selectedBooks[id][0] = quantity;
    }
    updatePrice();
}

function changePurchasePrice(n) {
    var price = parseFloat(n.querySelector('input[type=number]').value);
    var id = n.getAttribute("data-book-id");
    if (price <= 0) {
        alert("购买价格不能低于0元！");
        n.querySelector('input[type=number]').value = books[id].retail_price;
    } else {
        selectedBooks[id][1] = price;
    }
    updatePrice();
}

function updatePrice() {
    itemPrice = 0;
    for (let book_id in selectedBooks) {
        itemPrice += selectedBooks[book_id][0] * selectedBooks[book_id][1];
    }
    totalPrice = itemPrice + otherPrice;
    $('#item_price').text('￥' + itemPrice.toFixed(2));
    $('#oth-price').text('￥' + otherPrice.toFixed(2));
    $('#total_price').text('￥' + totalPrice.toFixed(2));
    $('#checkout_price').text('￥' + totalPrice.toFixed(2));
}

function submitOrder() {
    var notes = $('#order-notes').val();
    var order_data = {
        'type': orderType,
        'notes': notes,
        'books': selectedBooks,
        'customer': $('#custom-info').val()
    };
    $.ajax({
        url: order_url,
        method: "POST",
        data: JSON.stringify(order_data),
        contentType: 'application/json',
        success: function (response) {
            alert("下单成功!");
            window.location.reload();
        },
        error: function (response) {
            alert("下单失败!");
        }
    })
}

function changeOrderType() {
    if (!$('#books-list').html() || confirm("切换订单类型将会清空已选择的书籍，确认吗？")) {
        orderType = orderType === 1 ? 0 : 1;
        selectedBooks = {};
        $('#books-list').html(``);
        if (orderType === 1) {
            $('#new-book-button').attr("disabled", "disabled");
            $('#select-book-button').text("从库存中选择");
            $('#custom-info-col').removeAttr("hidden");
            booksToRender = booksInStock;
            renderBookImages();
            renderPaginationLinks();
        } else {
            $('#new-book-button').removeAttr("disabled");
            $('#select-book-button').text("从图书中选择");
            $('#custom-info-col').attr("hidden", "hidden");
            booksToRender = books;
            renderBookImages();
            renderPaginationLinks();
        }
    } else {
        if (orderType === 1) {
            $('#purchaseRadio').prop('checked', false);
            $('#salesRadio').prop('checked', true);
        } else {
            $('#salesRadio').prop('checked', false);
            $('#purchaseRadio').prop('checked', true);
        }
    }
}

function addBook() {
    const form = $('#new-book');
    let isValid = true;
    form.find('[required]').each(function () {
        const field = $(this);
        if (!field.val()) {
            isValid = false;
            field.addClass('is-invalid');
        } else {
            field.removeClass('is-invalid');
        }
    });
    if (!isValid) {
        return;
    }
    const formData = new FormData(form[0]);
    $.ajax({
        url: addBookApi,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            $('#notice').text();
            loadBooks();
            selectedBookId = data['new_id'];
            selectedBook = books.find(function (book) {
                return book.book_id == selectedBookId;
            });
            selectBook();
            $('#add-book-modal').modal('hide');
        },
        error: function (error) {
            $('#notice').text(error.responseJSON.errors);
        }
    });
}

$(document).ready(function () {
    loadBooks();
    //点击图书图片后弹出的确认信息modal
    $('#book-image-container').on('click', '.book-image', function () {
        selectedBookId = $(this).data('book-id');
        selectedBook = books.find(function (book) {
            return book.book_id == selectedBookId;
        });
        $('#confirm-bookname').text(selectedBook.bookname);
        $('#confirm-img').attr('src', selectedBook.img);
        $('#confirm-author').text(selectedBook.author);
        $('#confirm-publisher').text(selectedBook.publisher);
        $('#confirm-format').text(selectedBook.format);
        $('#confirm-rprice').text(selectedBook.retail_price);
        $('#confirm-stock').text(selectedBook.count);
        $('#confirm-isbn').text(selectedBook.ISBN);
        if (selectedBooks.hasOwnProperty(selectedBookId)) {
            $('#confirm-button').attr("disabled", "disabled");
        } else {
            $('#confirm-button').removeAttr("disabled");
        }
        $('#confirm-book-modal').modal('show');
    });
    //分页
    $('#pagination-container').on('click', '.page-link', function () {
        var page = $(this).data('page');
        var direction = $(this).data('direction');
        if (direction == 'prev' && currentPage > 1) {
            currentPage--;
        } else if (direction == 'next' && currentPage < totalPages) {
            currentPage++;
        } else {
            currentPage = page;
        }
        renderBookImages();
        renderPaginationLinks();
    });

});
