from datetime import date

from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models, NotSupportedError
from django.utils import timezone


# 数据库视图Views的基类
class CustomView(models.Model):
    def save(self, *args, **kwargs):
        raise NotSupportedError(
            "This model is tied to a view, it cannot be added or modified."
        )

    class Meta:
        managed = False
        abstract = True


# 用户管理类
class NewUserManager(UserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_commonuser", False)
        return self._create_user(username, email, password, **extra_fields)

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_commonuser", False)
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("superuser must have is_superuser=True.")
        return self._create_user(username, email, password, **extra_fields)


class Account(AbstractUser):
    GENDER_CHOICES = ((0, "male"), (1, "female"))

    work_id = models.AutoField(verbose_name="工号", primary_key=True)
    name = models.CharField(max_length=20, verbose_name="姓名")
    gender = models.SmallIntegerField(
        choices=GENDER_CHOICES, default=0, verbose_name="性别"
    )
    birthday = models.DateField(verbose_name="出生日期")
    avatar = models.ImageField(
        verbose_name="头像", upload_to="users/", default="users/default.jpg"
    )
    is_commonuser = models.BooleanField(default=True, verbose_name="普通用户")
    REQUIRED_FIELDS = ["name", "gender", "birthday"]

    # --- Overwritten的属性和方法 --- #
    is_staff = True
    is_active = True
    first_name = ""
    last_name = ""

    objects = NewUserManager()

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name

    # --- --- #

    class Meta:
        db_table = "account"  # 指明数据库表名
        verbose_name = "账号"  # 在admin站点中显示的名称
        verbose_name_plural = verbose_name  # 显示的复数名称

    def __str__(self):
        return self.username

    def age(self):
        today = date.today()
        born = self.birthday
        rest = 1 if (today.month, today.day) < (born.month, born.day) else 0
        return today.year - born.year - rest


class Book(models.Model):
    book_id = models.AutoField(verbose_name="书籍编号", primary_key=True)
    ISBN = models.CharField(max_length=16, verbose_name="ISBN", unique=True)
    bookname = models.CharField(max_length=40, verbose_name="书名")
    author = models.CharField(max_length=40, verbose_name="作者")
    publisher = models.CharField(max_length=40, verbose_name="出版社")
    retail_price = models.DecimalField(
        max_digits=6, decimal_places=2, verbose_name="零售价"
    )
    genre = models.CharField(max_length=30, verbose_name="内容体裁", default="未分类")
    format = models.CharField(max_length=10, verbose_name="书籍格式", default="平装")
    img = models.ImageField(
        verbose_name="封面", upload_to="books/", default="books/default.jpeg"
    )

    class Meta:
        db_table = "book"
        verbose_name = "图书"
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.bookname


class Stock(models.Model):
    stock_id = models.AutoField(verbose_name="stock_id", primary_key=True)
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    count = models.SmallIntegerField(verbose_name="库存数量")
    inventory_location = models.CharField(max_length=20, verbose_name="库存位置")

    class Meta:
        db_table = "stock"
        verbose_name = "库存"
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.stock_id


class BooksInStockView(CustomView):
    stock_id = models.IntegerField(verbose_name="stock_id", primary_key=True)
    book_id = models.IntegerField(verbose_name="书籍编号")
    count = models.SmallIntegerField(verbose_name="库存数量")
    ISBN = models.CharField(max_length=16, verbose_name="ISBN", unique=True)
    bookname = models.CharField(max_length=40, verbose_name="书名")
    inventory_location = models.CharField(max_length=20, verbose_name="库存位置")
    author = models.CharField(max_length=40, verbose_name="作者")
    publisher = models.CharField(max_length=40, verbose_name="出版社")
    retail_price = models.DecimalField(
        max_digits=6, decimal_places=2, verbose_name="零售价"
    )
    genre = models.CharField(max_length=30, verbose_name="内容体裁", default="未分类")
    format = models.CharField(max_length=10, verbose_name="书籍格式", default="平装")
    img = models.ImageField(verbose_name="封面", upload_to="books/")

    class Meta:
        managed = False  # 不由Django创建
        db_table = "view_books_in_stock"
        verbose_name = "BooksInStockView"
        verbose_name_plural = verbose_name


class BooksView(CustomView):
    stock_id = models.IntegerField(verbose_name="stock_id", null=True)
    book_id = models.IntegerField(verbose_name="书籍编号", primary_key=True)
    count = models.SmallIntegerField(verbose_name="库存数量", null=True)
    ISBN = models.CharField(max_length=16, verbose_name="ISBN", unique=True)
    bookname = models.CharField(max_length=40, verbose_name="书名")
    inventory_location = models.CharField(
        max_length=20, verbose_name="库存位置", null=True
    )
    author = models.CharField(max_length=40, verbose_name="作者")
    publisher = models.CharField(max_length=40, verbose_name="出版社")
    retail_price = models.DecimalField(
        max_digits=6, decimal_places=2, verbose_name="零售价"
    )
    genre = models.CharField(max_length=30, verbose_name="内容体裁", default="未分类")
    format = models.CharField(max_length=10, verbose_name="书籍格式", default="平装")
    img = models.ImageField(verbose_name="封面", upload_to="books/")

    class Meta:
        managed = False
        db_table = "view_books"
        verbose_name = "BooksInStockView"
        verbose_name_plural = verbose_name


class Order(models.Model):
    ORDER_TYPE = ((0, "purchase"), (1, "sales"))
    order_id = models.AutoField(verbose_name="订单编号", primary_key=True)
    order_type = models.SmallIntegerField(
        choices=ORDER_TYPE, default=0, verbose_name="订单类型"
    )
    create_time = models.DateTimeField(default=timezone.now, verbose_name="时间")
    customer = models.CharField(verbose_name="客户姓名", max_length=40, blank=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2, verbose_name="金额")
    note = models.CharField(verbose_name="备注", max_length=40)

    class Meta:
        db_table = "order"
        verbose_name = "订单"
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.order_id


class OrderItems(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, verbose_name="订单编号")
    book = models.ForeignKey(Book, on_delete=models.PROTECT, verbose_name="书籍编号")
    quantity = models.IntegerField(verbose_name="数量")
    price = models.DecimalField(max_digits=6, decimal_places=2, verbose_name="单价")

    class Meta:
        db_table = "order_items"
        verbose_name = "订单内容"
        verbose_name_plural = verbose_name


class OrderStatusHistory(models.Model):
    ORDER_STATUS = (
        (-1, "error"),
        (0, "waiting for payment"),
        (1, "waiting for shipping"),
        (2, "received refund request"),
        (3, "received refund items"),
        (4, "completed"),
        (5, "refunded"),
        (6, "closed"),
    )
    order = models.ForeignKey(Order, on_delete=models.CASCADE, verbose_name="订单编号")
    time = models.DateTimeField(default=timezone.now, verbose_name="时间")
    status = models.SmallIntegerField(
        choices=ORDER_STATUS, default=0, verbose_name="订单状态"
    )
    work = models.ForeignKey(Account, on_delete=models.PROTECT, verbose_name="操作用户")

    class Meta:
        db_table = "order_status_history"
        verbose_name = "订单状态"
        verbose_name_plural = verbose_name


class OrderItemsView(CustomView):
    order_id = models.IntegerField(verbose_name="订单编号", primary_key=True)
    book_id = models.IntegerField(verbose_name="书籍编号")
    bookname = models.CharField(max_length=40, verbose_name="书名")
    img = models.ImageField(verbose_name="封面", upload_to="books/")
    quantity = models.IntegerField(verbose_name="数量")
    price = models.DecimalField(max_digits=6, decimal_places=2, verbose_name="单价")
    inventory_location = models.CharField(max_length=20, verbose_name="库存位置")
    

    class Meta:
        managed = False
        db_table = "view_order_items"
        verbose_name = "OrderItemsView"
        verbose_name_plural = verbose_name


class OrderStatusView(CustomView):
    order_id = models.IntegerField(verbose_name="订单编号", primary_key=True)
    status = models.SmallIntegerField(verbose_name="订单状态")
    time = models.DateTimeField(default=timezone.now, verbose_name="时间")
    username = models.CharField(max_length=150, verbose_name="用户名")
    name = models.CharField(max_length=20, verbose_name="姓名")

    class Meta:
        managed = False
        db_table = "view_order_status"
        verbose_name = "OrderStatusView"
        verbose_name_plural = verbose_name



class Financial(models.Model):
    FIN_TYPE = (
        # (-1, 'error'),
        (0, "purchase order payment"),  # 付钱
        (1, "sales order payment"),  # 收钱
        (2, "sales order refund"),  # 付钱
    )
    FIN_STATUS = (
        (0, "pending"),
        (1, "processed"),
        (2, "closed"),
        # (3, 'rejected')
    )
    fin_id = models.AutoField(verbose_name="流水编号", primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, verbose_name="订单编号")
    fin_type = models.SmallIntegerField(
        choices=FIN_TYPE, default=0, verbose_name="财务类型"
    )
    fin_status = models.SmallIntegerField(
        choices=FIN_STATUS, default=0, verbose_name="当前状态"
    )
    create_work = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        verbose_name="创建用户",
        related_name="finan_create",
    )
    create_time = models.DateTimeField(default=timezone.now, verbose_name="创建时间")
    processed_time = models.DateTimeField(verbose_name="处理时间", null=True)
    process_work = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        verbose_name="操作用户",
        null=True,
        related_name="finan_process",
    )

    class Meta:
        db_table = "financial"
        verbose_name = "财务"
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.fin_id


class FinancialView(CustomView):
    fin_id = models.IntegerField(verbose_name="流水编号", primary_key=True)
    order_id = models.IntegerField(verbose_name="订单编号")
    fin_type = models.SmallIntegerField(default=0, verbose_name="财务类型")
    fin_status = models.SmallIntegerField(default=0, verbose_name="当前状态")
    create_time = models.DateTimeField(verbose_name="创建时间")
    processed_time = models.DateTimeField(verbose_name="处理时间", null=True)
    amount = models.DecimalField(max_digits=6, decimal_places=2, verbose_name="金额")
    create_username = models.CharField(max_length=150, verbose_name="用户名")
    create_name = models.CharField(max_length=20, verbose_name="姓名")
    process_username = models.CharField(max_length=150, verbose_name="用户名")
    process_name = models.CharField(max_length=20, verbose_name="姓名")
    create_month = models.IntegerField(verbose_name="创建月份")
    create_work_id = models.IntegerField(verbose_name="工号")

    class Meta:
        managed = False
        db_table = "view_financial"
        verbose_name = "FinancialView"
        verbose_name_plural = verbose_name
