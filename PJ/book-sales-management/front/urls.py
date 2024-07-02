from django.urls import path

from . import views

app_name = 'front'

urlpatterns = [
    path("", views.index, name='index'),
    path("notfound", views.not_found, name='not_found'),
    path("login", views.login_front, name="login"),
    path("stocks", views.stock, name="stock"),
    path("book-tables", views.book_tables, name="tables"),
    path("books", views.book_tables, name="books"),
    path("orders", views.orders, name="orders"),
    path("orders/make", views.make_orders, name="make_orders"),
    path("users/profile", views.profile, name="profile"),
    path("users/manage", views.users_manage, name="users_manage"),
    path("financial", views.financial, name="financial"),
    path("financial/overview", views.overview_financial, name="overview_financial"),
]
