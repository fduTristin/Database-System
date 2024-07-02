from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required


@login_required()
def index(request):
    if request.user.is_commonuser:
        return render(request, 'front/index-common.html')
    else:
        return render(request, 'front/index.html')


def not_found(request, exception):
    return render(request, 'front/404.html')


def login_front(request):
    if request.user.is_authenticated:
        return redirect('/front/')
    else:
        return render(request, 'front/login.html')


@login_required()
def overview_financial(request):
    return render(request, 'front/financial-overview.html')


@login_required()
def stock(request):
    return render(request, 'front/stock.html')


@login_required()
def book_tables(request):
    if request.user.is_commonuser:
        return render(request, 'front/books-common.html')
    else:
        return render(request, 'front/books.html')


@login_required()
def users_manage(request):
    if request.user.is_superuser:
        return render(request, 'front/users-manage.html')
    else:
        return render(request, 'front/index.html')


@login_required()
def make_orders(request):
    if request.user.is_commonuser:
        return render(request, 'front/make-orders-common.html')
    else:
        return render(request, 'front/make-orders.html')


@login_required()
def orders(request):
    if request.user.is_commonuser:
        return render(request, 'front/orders-common.html')
    else:
        return render(request, 'front/orders.html')


@login_required()
def profile(request):
    return render(request, 'front/profile.html')


@login_required()
def financial(request):
    return render(request, 'front/financial.html')
