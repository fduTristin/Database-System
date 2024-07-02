from django.urls import path

from . import views

app_name = 'backend'


urlpatterns = [
    path('login', views.login_api, name='login'),
    path('logout', views.logout_api, name='logout'),
    path('api/index', views.index_data, name='index_data'),
    path('api/books', views.book_api, name='book_ajax'),
    path('api/stock', views.stock_api, name='stock_ajax'),
    path('api/accounts', views.account_api, name='account_ajax'),
    path('api/user/info', views.user_info, name='user_info'),
    path('api/user/update_pwd', views.update_password, name='update_pwd'),
    path('api/user/update_avt', views.update_avatar, name='update_avatar'),
    path('api/order/create', views.create_order, name='create_order'),
    path('api/order/info', views.order_info, name='order_info'),
    path('api/order/items', views.order_items, name='order_items'),
    path('api/order/books', views.books_for_order, name='books_for_order'),
    path('api/order/add-book', views.add_book, name='add_book'),
    path('api/order/status', views.order_status, name='order_status'),
    path('api/order/detail', views.order_detail, name='order_detail'),
    path('api/order/update', views.update_order_status, name='update_order_status'),
    path('api/financial/info', views.financial_info, name='financial_info'),
    path('api/financial/update', views.update_financial_status, name='update_financial_status'),
    path('api/financial/monthly', views.financial_statistics, name='financial_monthly'),
]
