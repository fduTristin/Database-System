import base64
import datetime
import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.base import ContentFile
from django.db import IntegrityError, DataError, transaction
from django.db.models import ProtectedError, Sum, Count, Avg
from django.db.models.functions import ExtractYear, ExtractMonth
from django.http import JsonResponse, QueryDict
from django.shortcuts import render, redirect
from django.utils import timezone
from django.views.decorators.http import require_http_methods, require_GET, require_POST

from . import models


# --- 非api函数，被多次复用的代码块 ---#


# 从传入的model中获得图书信息，并返回
def get_book_info(model, hide=False):
    data = []
    for obj in model.objects.all():
        book = {}
        for attr in (
            "stock_id",
            "book_id",
            "count",
            "ISBN",
            "bookname",
            "inventory_location",
            "author",
            "publisher",
            "genre",
            "format",
            "retail_price",
        ):
            book[attr] = getattr(obj, attr)
        book["img"] = obj.img.url
        if hide:
            if book["count"] > 0:
                data.append(book)
        else:
            data.append(book)
    return data


# 年度统计数据
def statistics_data(user):
    current_year = timezone.now().year

    if user.is_commonuser:
        # SELECT SUM(amount) FROM FinancialView WHERE fin_type=1 AND fin_status=1 AND EXTRACT(YEAR FROM create_time)=2024;
        income_total = models.FinancialView.objects.filter(
            create_time__year=current_year,
            fin_type=1,
            fin_status=1,
            create_work_id=user.work_id,
        ).aggregate(Sum("amount"))["amount__sum"]

        # 先用0填充每个月
        income_monthly_amounts = {key: 0 for key in range(1, timezone.now().month + 1)}

        # 对每个月的收入总金额进行统计，会得到一个{月份：金额}的dict
        # SELECT EXTRACT(MONTH FROM create_time),SUM(amount) FROM view_financial
        #     WHERE fin_type=1 AND fin_status=1 AND EXTRACT(YEAR FROM create_time)=2024
        #     GROUP BY EXTRACT(MONTH FROM create_time);

        income_total_query = (
            models.FinancialView.objects.filter(
                create_time__year=current_year,
                fin_type=1,
                fin_status=1,
                create_work_id=user.work_id,
            )
            .values("create_month")
            .annotate(total_amount=Sum("amount"))
        )
        for record in income_total_query:
            income_monthly_amounts[record["create_month"]] = record["total_amount"]

        # SELECT SUM(amount) FROM FinancialView WHERE fin_type=0 AND fin_status=1 AND EXTRACT(YEAR FROM create_time)=2024;
        purchase_total = models.FinancialView.objects.filter(
            create_time__year=current_year,
            fin_type=0,
            fin_status=1,
            create_work_id=user.work_id,
        ).aggregate(Sum("amount"))["amount__sum"]

        # SELECT SUM(amount) FROM FinancialView WHERE fin_type=2 AND fin_status=1 AND EXTRACT(YEAR FROM create_time)=2024;
        refund_total = models.FinancialView.objects.filter(
            create_time__year=current_year,
            fin_type=2,
            fin_status=1,
            create_work_id=user.work_id,
        ).aggregate(Sum("amount"))["amount__sum"]

        expend_monthly_amounts = {key: 0 for key in range(1, timezone.now().month + 1)}

        # SELECT EXTRACT(MONTH FROM create_time),SUM(amount) FROM view_financial
        #     WHERE fin_type<>1 AND fin_status=1
        #     GROUP BY EXTRACT(MONTH FROM create_time);
        expend_total_query = (
            models.FinancialView.objects.filter(
                create_time__year=current_year,
                fin_status=1,
                create_work_id=user.work_id,
            )
            .exclude(fin_type=1)
            .values("create_month")
            .annotate(total_amount=Sum("amount"))
        )

        for record in expend_total_query:
            expend_monthly_amounts[record["create_month"]] = record["total_amount"]

        income_total = income_total if income_total else 0
        purchase_total = purchase_total if purchase_total else 0
        refund_total = refund_total if refund_total else 0

        return {
            "income": list(income_monthly_amounts.values()),
            "expend": list(expend_monthly_amounts.values()),
            "income_t": income_total,
            "purchase_t": purchase_total,
            "refund_t": refund_total,
        }

    else:
        # SELECT SUM(amount) FROM FinancialView WHERE fin_type=1 AND fin_status=1 AND EXTRACT(YEAR FROM create_time)=2024;
        income_total = models.FinancialView.objects.filter(
            create_time__year=current_year, fin_type=1, fin_status=1
        ).aggregate(Sum("amount"))["amount__sum"]

        # 先用0填充每个月
        income_monthly_amounts = {key: 0 for key in range(1, timezone.now().month + 1)}

        # 对每个月的收入总金额进行统计，会得到一个{月份：金额}的dict
        # SELECT EXTRACT(MONTH FROM create_time),SUM(amount) FROM view_financial
        #     WHERE fin_type=1 AND fin_status=1 AND EXTRACT(YEAR FROM create_time)=2024
        #     GROUP BY EXTRACT(MONTH FROM create_time);

        income_total_query = (
            models.FinancialView.objects.filter(
                create_time__year=current_year, fin_type=1, fin_status=1
            )
            .values("create_month")
            .annotate(total_amount=Sum("amount"))
        )
        for record in income_total_query:
            income_monthly_amounts[record["create_month"]] = record["total_amount"]

        # SELECT SUM(amount) FROM FinancialView WHERE fin_type=0 AND fin_status=1 AND EXTRACT(YEAR FROM create_time)=2024;
        purchase_total = models.FinancialView.objects.filter(
            create_time__year=current_year, fin_type=0, fin_status=1
        ).aggregate(Sum("amount"))["amount__sum"]

        # SELECT SUM(amount) FROM FinancialView WHERE fin_type=2 AND fin_status=1 AND EXTRACT(YEAR FROM create_time)=2024;
        refund_total = models.FinancialView.objects.filter(
            create_time__year=current_year, fin_type=2, fin_status=1
        ).aggregate(Sum("amount"))["amount__sum"]

        expend_monthly_amounts = {key: 0 for key in range(1, timezone.now().month + 1)}

        # SELECT EXTRACT(MONTH FROM create_time),SUM(amount) FROM view_financial
        #     WHERE fin_type<>1 AND fin_status=1
        #     GROUP BY EXTRACT(MONTH FROM create_time);
        expend_total_query = (
            models.FinancialView.objects.filter(
                create_time__year=current_year, fin_status=1
            )
            .exclude(fin_type=1)
            .values("create_month")
            .annotate(total_amount=Sum("amount"))
        )

        for record in expend_total_query:
            expend_monthly_amounts[record["create_month"]] = record["total_amount"]

        income_total = income_total if income_total else 0
        purchase_total = purchase_total if purchase_total else 0
        refund_total = refund_total if refund_total else 0

        return {
            "income": list(income_monthly_amounts.values()),
            "expend": list(expend_monthly_amounts.values()),
            "income_t": income_total,
            "purchase_t": purchase_total,
            "refund_t": refund_total,
        }


# --- 后端api函数 ---#


# 登录
@require_POST
def login_api(request):
    username = request.POST["username"]
    password = request.POST["password"]
    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        return redirect("/front/")
    else:
        return render(request, "front/login.html", {"failed": True})


# 登出
@login_required()
def logout_api(request):
    logout(request)
    return redirect("/front/")


# 图书相关
@login_required()
@require_http_methods(["GET", "POST", "PUT"])
def book_api(request):
    # 获得图书信息
    if request.method == "GET":
        try:
            data = []
            for obj in models.Book.objects.all():
                book = {}
                for attr in (
                    "book_id",
                    "ISBN",
                    "bookname",
                    "author",
                    "publisher",
                    "retail_price",
                    "genre",
                    "format",
                ):
                    book[attr] = getattr(obj, attr)
                book["img"] = obj.img.url
                # 为了配合前端更新图书图片的功能
                book["new_image"] = ""
                data.append(book)
            return JsonResponse({"data": data})
        except Exception as result:
            return JsonResponse({"errors": repr(result)}, status=500)

    elif request.method == "POST":
        # 删除图书
        if request.POST.get("request_type") == "delete":
            try:
                book = models.Book.objects.get(book_id=request.POST.get("book_id"))
                book.delete()
                return JsonResponse({"success": True})
            except ProtectedError:
                return JsonResponse(
                    {"errors": "该图书有库存或有相关订单，无法删除！"}, status=500
                )
            except Exception as result:
                return JsonResponse({"errors": repr(result)}, status=500)
        # 编辑图书
        elif request.POST.get("request_type") == "edit":
            try:
                _book_id = request.POST.get("book_id")
                book = models.Book.objects.get(book_id=_book_id)
                book.ISBN = request.POST.get("ISBN")
                book.bookname = request.POST.get("bookname")
                book.author = request.POST.get("author")
                book.publisher = request.POST.get("publisher")
                book.retail_price = request.POST.get("retail_price")
                book.genre = request.POST.get("genre")
                book.format = request.POST.get("format")
                # 更新封面
                if request.POST.get("new_image"):
                    # 删除旧图片
                    if book.img != "books/default.jpeg":
                        book.img.delete()
                    img_format, img_str = request.POST.get("new_image").split(
                        ";base64,"
                    )
                    ext = img_format.split("/")[-1]
                    image_data = ContentFile(
                        base64.b64decode(img_str), name=f"id_{_book_id}.{ext}"
                    )
                    book.img.save(f"id_{_book_id}.{ext}", image_data, save=True)
                book.save()
                return JsonResponse({"success": True})
            except DataError:
                return JsonResponse({"errors": "零售价必须小于等于10000元"}, status=500)
            except IntegrityError:
                return JsonResponse({"errors": "ISBN号与已有图书重复！"}, status=500)
            except Exception as result:
                return JsonResponse({"errors": repr(result)}, status=500)

        else:
            return JsonResponse({"errors": "请求参数错误"}, status=500)
    # 添加新书
    elif request.method == "PUT":
        try:
            put = dict(QueryDict(request.body).items())
            book = models.Book(
                ISBN=put["ISBN"],
                bookname=put["bookname"],
                author=put["author"],
                publisher=put["publisher"],
                retail_price=put["retail_price"],
                genre=put["genre"],
                format=put["format"],
            )
            book.save()
            if put["new_image"]:
                img_format, img_str = put["new_image"].split(";base64,")
                ext = img_format.split("/")[-1]
                image_data = ContentFile(
                    base64.b64decode(img_str), name=f"id_{book.book_id}.{ext}"
                )
                book.img.save(f"id_{book.book_id}.{ext}", image_data, save=True)
            book.save()
            return JsonResponse({"success": True})
        except DataError:
            return JsonResponse({"errors": "零售价必须小于10000元"}, status=500)
        except IntegrityError:
            return JsonResponse({"errors": "ISBN号与已有图书重复！"}, status=500)
        except Exception as result:
            return JsonResponse({"errors": repr(result)}, status=500)


# 处理在创建订单界面添加新书
@login_required()
@require_POST
def add_book(request):
    try:
        image = request.FILES.get("book-image-input")
        book = models.Book(
            ISBN=request.POST.get("book-isbn-input"),
            bookname=request.POST.get("book-name-input"),
            author=request.POST.get("book-author-input"),
            publisher=request.POST.get("book-publisher-input"),
            retail_price=request.POST.get("book-price-input"),
            genre=request.POST.get("book-genre-input"),
            format=request.POST.get("book-format-input"),
        )
        if image is not None:
            book.img = image
        book.save()
        return JsonResponse({"success": True, "new_id": book.book_id})
    except IntegrityError:
        return JsonResponse({"errors": "ISBN号与已有图书重复！"}, status=500)
    except DataError:
        return JsonResponse({"errors": "零售价必须小于10000元"}, status=500)
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 库存相关
@login_required()
@require_http_methods(["POST", "GET"])
def stock_api(request):
    # 获得库存信息
    if request.method == "GET":
        try:
            data = get_book_info(models.BooksInStockView, hide=True)
            return JsonResponse({"data": data})
        except Exception as result:
            return JsonResponse({"errors": repr(result)}, status=500)
    # 更新库存位置
    else:
        try:
            stock = models.Stock.objects.get(stock_id=request.POST.get("stock_id"))
            stock.inventory_location = request.POST.get("new_location")
            stock.save()
            return JsonResponse({"success": "true"})
        except Exception as result:
            return JsonResponse({"errors": repr(result)}, status=500)


# 用于处理创建订单时的图书详细信息
@login_required()
@require_GET
def books_for_order(request):
    try:
        data = get_book_info(models.BooksView)
        return JsonResponse({"data": data})
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 用于用户管理
@login_required()
@require_http_methods(["GET", "POST", "PUT"])
def account_api(request):
    # 获得各个账户信息
    if request.method == "GET":
        objs = list(models.Account.objects.all())
        data = []
        for user in objs:
            # 密码占位符
            person = {"password": "****"}
            for attr in ("username", "work_id", "name", "birthday"):
                person[attr] = getattr(user, attr)
            # 处理时区、格式化时间
            for attr in ("date_joined", "last_login"):
                if getattr(user, attr):
                    person[attr] = timezone.localtime(getattr(user, attr)).strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                else:
                    person[attr] = "-"
            # 邮箱占位符、处理性别、用户类型
            person["email"] = (
                "-" if not getattr(user, "email") else getattr(user, "email")
            )
            person["gender"] = "男" if getattr(user, "gender") == 0 else "女"
            person["type"] = (
                "超级管理员"
                if getattr(user, "is_superuser")
                else ("用户" if getattr(user, "is_commonuser") == True else "普通员工")
            )
            person["age"] = user.age()
            data.append(person)
        return JsonResponse({"data": data})

    elif request.method == "POST":
        # 删除用户
        if request.POST.get("request_type") == "delete":
            try:
                user = models.Account.objects.get(work_id=request.POST.get("work_id"))
                if user.is_superuser:
                    return JsonResponse(
                        {"errors": "超级管理员账号无法被删除！"}, status=500
                    )
                else:
                    user.delete()
                    return JsonResponse({"success": True})
            except ProtectedError:
                return JsonResponse(
                    {"errors": "存在与该用户相关的订单或流水，无法删除！"}, status=500
                )
            except Exception as result:
                return JsonResponse({"errors": repr(result)}, status=500)
        # 编辑用户
        elif request.POST.get("request_type") == "edit":
            try:
                user = models.Account.objects.get(work_id=request.POST.get("work_id"))
                user.name = request.POST.get("name")
                user.username = request.POST.get("username")
                if request.POST.get("password") != "****":
                    user.set_password(request.POST.get("password"))
                user.gender = 0 if request.POST.get("gender") == "男" else 1
                user.birthday = request.POST.get("birthday")
                if request.POST.get("type") == "超级管理员":
                    user.is_superuser = 1
                    user.is_commonuser = 0
                elif request.POST.get("type") == "用户":
                    user.is_superuser = 0
                    user.is_commonuser = 1
                else:
                    user.is_superuser = 0
                    user.is_commonuser = 0
                user.save()
                return JsonResponse({"success": "true"})
            except IntegrityError:
                return JsonResponse({"errors": "用户名已存在！"}, status=500)
            except Exception as result:
                return JsonResponse({"errors": repr(result)}, status=500)
        else:
            return JsonResponse({"errors": "请求参数错误"}, status=500)
    # 添加用户
    elif request.method == "PUT":
        try:
            put = dict(QueryDict(request.body).items())
            put["gender"] = 0 if put["gender"] == "男" else 1
            user = models.Account.objects.create_user(
                username=put["username"],
                password=put["password"],
                name=put["name"],
                gender=put["gender"],
                birthday=put["birthday"],
                email=put["email"],
            )
            if put["type"] == "超级管理员":
                user.is_superuser = True
            if put["type"] == "用户":
                user.is_commonuser = True
            user.save()
            return JsonResponse({"success": "true"})
        except Exception as result:
            return JsonResponse({"errors": repr(result)}, status=500)


# 用于profile
@login_required()
@require_http_methods(["GET", "POST"])
def user_info(request):
    # 获得个人信息
    if request.method == "GET":
        try:
            user = models.Account.objects.get(work_id=request.user.work_id)
            person = {
                "username": user.username,
                "work_id": user.work_id,
                "name": user.name,
                "birthday": user.birthday,
                "gender": "男" if user.gender == 0 else "女",
                "email": user.email,
                "type": (
                    "超级管理员"
                    if getattr(user, "is_superuser")
                    else (
                        "用户" if getattr(user, "is_commonuser") == True else "普通员工"
                    )
                ),
            }
            return JsonResponse(person)
        except Exception as result:
            return JsonResponse({"errors": repr(result)}, status=500)
    # 编辑个人信息
    if request.method == "POST":
        try:
            user = models.Account.objects.get(work_id=request.user.work_id)
            user.name = request.POST.get("name")
            user.username = request.POST.get("username")
            user.gender = 0 if request.POST.get("gender") == "男" else 1
            user.birthday = request.POST.get("birthday")
            user.email = request.POST.get("email")
            user.save()
            return JsonResponse({"success": "success"})
        except Exception as result:
            return JsonResponse({"errors": repr(result)}, status=500)


# 用于修改密码
@login_required()
@require_POST
def update_password(request):
    try:
        if request.user.check_password(request.POST.get("old_pwd")):
            user = models.Account.objects.get(work_id=request.user.work_id)
            user.set_password(request.POST.get("new_pwd"))
            user.save()
            logout(request)
            return JsonResponse({"success": "true"})
        else:
            return JsonResponse({"success": "false", "errors": "原密码有误！"})
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 用于更新头像
@login_required()
@require_POST
def update_avatar(request):
    try:
        # 是否恢复默认头像
        if request.POST.get("use_default") == "true":
            user = models.Account.objects.get(work_id=request.user.work_id)
            # 如果当前使用的不是默认头像，就把当前的头像文件删掉
            if user.avatar.path[-18:] != "\\users\\default.jpg":
                user.avatar.delete()
            user.avatar = "users/default.jpg"
            user.save()
            return JsonResponse({"success": "true"})
        # 从request中读取头像并保存
        else:
            user = models.Account.objects.get(work_id=request.user.work_id)
            image = request.FILES.get("avatar")
            if user.avatar.path[-18:] != "\\users\\default.jpg":
                user.avatar.delete()
            user.avatar = image
            user.save()
            return JsonResponse({"success": "true"})
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 用于创建订单
@login_required()
@require_POST
def create_order(request):
    try:
        # 保证了下面的几个insert操作一致性
        with transaction.atomic():
            # 创建订单
            order_data = json.loads(request.body)
            amount = 0
            order = models.Order(
                order_type=order_data["type"],
                note=order_data["notes"],
                customer=order_data["customer"],
                amount=0,
            )
            order.save()
            order_id = order.order_id
            # 创建orderItems，顺便统计总金额
            for book in order_data["books"].keys():
                quantity = order_data["books"][book][0]
                price = order_data["books"][book][1]
                item = models.OrderItems(
                    order_id=order_id, book_id=book, quantity=quantity, price=price
                )
                item.save()
                amount += quantity * price
                # 如果是销售订单，在库存中临时减去数量，防止超售
                if order.order_type == 1:
                    stock = models.Stock.objects.get(book_id=book)
                    if stock.count > quantity:
                        stock.count -= quantity
                    # 用-1可以防止trigger把这条记录删掉，从而保留库存位置信息（如果后续取消订单）
                    elif stock.count == quantity:
                        stock.count = -1
                    else:
                        raise DataError
                    stock.save()
            if amount == 0:
                raise Exception("空订单！")
            order.amount = amount
            order.save()
            # 创建orderStatusHistory
            status = models.OrderStatusHistory(
                order_id=order_id, status=0, work_id=request.user.work_id
            )
            status.save()
            # 创建财务流水
            finan = models.Financial(
                order_id=order_id,
                fin_type=order_data["type"],
                fin_status=0,
                create_work_id=request.user.work_id,
            )
            finan.save()
        return JsonResponse({"success": "true"})
    except DataError:
        return JsonResponse({"errors": "当前库存不足！"}, status=500)
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 用于获取订单列表以及相关统计数据
@login_required()
@require_GET
def order_info(request):
    try:
        data = []
        current_month = timezone.now().month
        expend_count = 0
        income_count = 0
        pending_count = 0
        monthly_count = 0
        # 按时间遍历
        for obj in models.Order.objects.all().order_by("-create_time"):
            # 只有订单发起者才能访问
            order = {}
            # 编号、类型、金额
            for attr in ("order_id", "order_type", "amount"):
                order[attr] = getattr(obj, attr)
            # 处理时区
            create_time = timezone.localtime(obj.create_time)
            order["create_time"] = create_time.strftime("%Y-%m-%d %H:%M:%S")
            if (
                not request.user.is_commonuser
            ) or models.OrderStatusHistory.objects.filter(
                work_id=request.user.work_id, order_id=obj.order_id, status=0
            ).exists():
                if create_time.month == current_month:
                    monthly_count += 1
                    if order["order_type"] == 1:
                        income_count += 1
                    else:
                        expend_count += 1

            if (
                not request.user.is_commonuser
            ) or models.OrderStatusHistory.objects.filter(
                work_id=request.user.work_id, order_id=obj.order_id, status=0
            ).exists():
                # 获取订单的最新一条状态
                # 对应： SELECT status FROM order_status_history WHERE order_id = 'xxx' ORDER BY time DESC LIMIT 1;
                order["status"] = (
                    models.OrderStatusHistory.objects.filter(order_id=obj.order_id)
                    .order_by("-time")
                    .first()
                    .status
                )
                if order["status"] in (0, 1, 2):
                    pending_count += 1

            # 获得该订单一共有几本书
            # 对应： SELECT COUNT(*) FROM order_items WHERE order_id = 'xxx';
            items = {
                "count": models.OrderItems.objects.filter(order_id=obj.order_id).count()
            }

            # 获得该订单的第一本书id和封面图片
            # 对应： SELECT book_id FROM order_items WHERE order_id = 'xxx' ORDER BY book_id DESC LIMIT 1;
            first_id = (
                models.OrderItems.objects.filter(order_id=obj.order_id)
                .order_by("-book_id")
                .first()
                .book_id
            )
            items["first"] = (
                models.Book.objects.filter(book_id=first_id).first().img.url
            )

            order["items"] = items

            if models.OrderStatusHistory.objects.filter(
                work_id=request.user.work_id, order_id=obj.order_id, status=0
            ).exists():
                data.append(order)
        return JsonResponse(
            {
                "data": data,
                "income": income_count,
                "expend": expend_count,
                "total": monthly_count,
                "pending": pending_count,
            }
        )
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 用于获取一个特定订单的完整商品列表
@login_required()
@require_GET
def order_items(request):
    try:
        data = []
        for obj in models.OrderItemsView.objects.filter(
            order_id=request.GET.get("order_id")
        ):
            item = {}
            for attr in (
                "order_id",
                "book_id",
                "bookname",
                "quantity",
                "price",
                "inventory_location",
            ):
                item[attr] = getattr(obj, attr)
            item["img"] = obj.img.url
            data.append(item)
        return JsonResponse({"data": data})
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 用于获取一个特定订单的历史状态
@login_required()
@require_GET
def order_status(request):
    try:
        data = list(
            models.OrderStatusView.objects.filter(
                order_id=request.GET.get("order_id")
            ).values()
        )
        for obj in data:
            obj["time"] = timezone.localtime(
                models.OrderStatusView.objects.get(
                    order_id=obj["order_id"], status=obj["status"]
                ).time
            ).strftime("%Y-%m-%d %H:%M:%S")
        return JsonResponse({"data": data})
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 用于获取一个特定订单的详细信息
@login_required()
@require_GET
def order_detail(request):
    try:
        obj = models.Order.objects.get(order_id=request.GET.get("order_id"))
        order = {}
        for attr in ("order_id", "customer", "order_type", "note", "amount"):
            order[attr] = getattr(obj, attr)
        return JsonResponse({"data": order})
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 用于更新订单状态
@login_required()
@require_POST
def update_order_status(request):
    new_status_map = {1: 6, 2: 2, 3: 4, 4: 4, 5: 3, 6: 4}
    try:
        with transaction.atomic():
            # 更新状态
            data = json.loads(request.body)
            order_id = data["order_id"]
            new_status = models.OrderStatusHistory(
                order_id=order_id,
                work_id=request.user.work_id,
                status=new_status_map[data["type"]],
            )
            new_status.save()

            if data["type"] in (4, 5):
                # 保存入库信息
                for book_id in data["location"].keys():
                    new_count = models.OrderItems.objects.get(
                        book_id=book_id, order_id=order_id
                    )
                    try:
                        stock = models.Stock.objects.get(book_id=book_id)
                        if stock.count > 0:
                            stock.count += new_count.quantity
                        else:
                            stock.count = new_count.quantity
                    except ObjectDoesNotExist:
                        stock = models.Stock(book_id=book_id, count=new_count.quantity)
                    stock.inventory_location = data["location"][book_id]
                    stock.save()

                    if data["type"] == 5:
                        # 创建待处理的退款财务流水
                        finan = models.Financial(
                            order_id=order_id,
                            fin_type=2,
                            fin_status=0,
                            create_work_id=request.user.work_id,
                        )
                        finan.save()
            elif data["type"] == 1:
                # 恢复库存
                for obj in models.OrderItemsView.objects.filter(order_id=order_id):
                    stock = models.Stock.objects.get(book_id=obj.book_id)
                    if stock.count == -1:
                        stock.count = obj.quantity
                    else:
                        stock.count += obj.quantity
                    stock.save()
                # 关闭pending流水
                finan = models.Financial.objects.get(order_id=order_id)
                finan.fin_status = 2
                finan.save()
            elif data["type"] == 3:
                if models.Order.objects.get(order_id=order_id).order_type == 1:
                    for obj in models.OrderItemsView.objects.filter(order_id=order_id):
                        stock = models.Stock.objects.get(book_id=obj.book_id)
                        if stock.count == -1:
                            stock.count = 0
                            stock.save()
        return JsonResponse({"success": "true"})
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 用于获取流水列表以及相关统计数据
@login_required()
@require_GET
def financial_info(request):
    try:
        # 每条流水的信息
        data = []
        for obj in models.FinancialView.objects.all().order_by("-create_time"):
            finan = {}
            for attr in (
                "fin_id",
                "order_id",
                "fin_type",
                "fin_status",
                "amount",
                "create_username",
                "create_name",
                "process_name",
                "process_username",
            ):
                finan[attr] = getattr(obj, attr)
            finan["create_time"] = timezone.localtime(obj.create_time).strftime(
                "%Y-%m-%d %H:%M:%S"
            )
            finan["processed_time"] = timezone.localtime(obj.processed_time).strftime(
                "%Y-%m-%d %H:%M:%S"
            )
            data.append(finan)

        # 网页上方四个卡片的统计信息
        current_date = timezone.now()

        # SELECT SUM(amount) FROM FinancialView WHERE fin_type=1 AND fin_status=1 AND EXTRACT(MONTH FROM create_time)=5
        # AND EXTRACT(YEAR FROM create_time)=2024;
        income_amount = models.FinancialView.objects.filter(
            create_time__year=current_date.year,
            create_month=current_date.month,
            fin_type=1,
            fin_status=1,
        ).aggregate(Sum("amount"))["amount__sum"]

        # SELECT SUM(amount) FROM FinancialView WHERE fin_type=1 AND fin_status=1 AND EXTRACT(MONTH FROM create_time)=5
        # AND EXTRACT(YEAR FROM create_time)=2024;
        expend_amount = (
            models.FinancialView.objects.filter(
                create_time__year=current_date.year,
                create_month=current_date.month,
                fin_status=1,
            )
            .exclude(fin_type=1)
            .aggregate(Sum("amount"))["amount__sum"]
        )

        # SELECT COUNT(amount) FROM FinancialView WHERE EXTRACT(MONTH FROM create_time)=5 AND
        # EXTRACT(YEAR FROM create_time)=2024;
        monthly_count = models.FinancialView.objects.filter(
            create_time__year=current_date.year, create_month=current_date.month
        ).aggregate(Count("amount"))["amount__count"]

        # SELECT COUNT(amount) FROM FinancialView WHERE fin_status=0;
        pending_count = models.FinancialView.objects.filter(fin_status=0).aggregate(
            Count("amount")
        )["amount__count"]
        income_amount = income_amount if income_amount else 0
        expend_amount = expend_amount if expend_amount else 0
        return JsonResponse(
            {
                "data": data,
                "income": income_amount,
                "expend": expend_amount,
                "total": monthly_count,
                "pending": pending_count,
            }
        )
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 用于更新流水状态
@login_required()
@require_POST
def update_financial_status(request):
    try:
        with transaction.atomic():
            # 更新流水状态
            data = json.loads(request.body)
            fin_id = data["fin_id"]
            finan = models.Financial.objects.get(fin_id=fin_id)
            finan.fin_status = 1
            finan.process_work_id = request.user.work_id
            finan.processed_time = timezone.localtime()
            # 创建OrderStatus
            if data["type"] in (0, 1):
                new_status = models.OrderStatusHistory(
                    order_id=finan.order_id, status=1, work_id=request.user.work_id
                )
            elif data["type"] == 2:
                # 恢复库存
                new_status = models.OrderStatusHistory(
                    order_id=finan.order_id, status=5, work_id=request.user.work_id
                )
            else:
                raise DataError
            finan.save()
            new_status.save()
        return JsonResponse({"success": "true"})
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 主页统计数据
@login_required()
@require_GET
def index_data(request):
    try:
        # 财务数据
        data = statistics_data(request.user)
        # 本月订单数量
        current_month = timezone.now().month
        monthly_count = 0
        if request.user.is_commonuser:
            for obj in models.OrderStatusHistory.objects.filter(
                status=0, work_id=request.user.work_id
            ).order_by("-time"):
                if obj.time.month == current_month:
                    monthly_count += 1
        else:
            for obj in models.OrderStatusHistory.objects.filter(status=0).order_by(
                "-time"
            ):
                if obj.time.month == current_month:
                    monthly_count += 1
        data["count"] = monthly_count
        return JsonResponse(data)
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)


# 流水总览数据
@login_required()
@require_http_methods(["GET", "POST"])
def financial_statistics(request):
    try:
        # 年度数据
        if request.method == "GET":
            return JsonResponse(statistics_data(request.user))
        # 指定时间的数据
        else:
            # 初始化结果
            summary_data = {i: {"count": 0, "sum": 0, "avg": 0} for i in range(3)}
            summary_data["income"] = 0
            summary_data["expend"] = 0
            summary_data["total"] = 0
            # 格式化前端传来的起止日期，并添加时区信息
            start_date = datetime.datetime.strptime(
                request.POST.get("start"), "%Y/%m/%d"
            )
            end_date = datetime.datetime.strptime(request.POST.get("end"), "%Y/%m/%d")
            start_date = timezone.make_aware(
                datetime.datetime.combine(start_date, datetime.datetime.min.time())
            )
            end_date = timezone.make_aware(
                datetime.datetime.combine(end_date, datetime.datetime.max.time())
            )

            # SELECT COUNT(amount) AS count, SUM(amount) AS sum, AVG(amount) AS avg
            # FROM FinancialView
            # WHERE fin_status=1 AND create_time BETWEEN start_date AND end_date;
            financial_data = (
                models.FinancialView.objects.filter(
                    create_time__range=(start_date, end_date), fin_status=1
                )
                .values("fin_type")
                .annotate(count=Count("fin_type"), sum=Sum("amount"), avg=Avg("amount"))
            )

            income = 0.0
            expend = 0.0
            for data in financial_data:
                summary_data[data["fin_type"]] = {
                    "count": data["count"],
                    "sum": float(data["sum"]),
                    "avg": round(float(data["avg"]), 2),
                }
                if data["fin_type"] == 1:
                    income += float(data["sum"])
                else:
                    expend += float(data["sum"])
            summary_data["income"] = income
            summary_data["expend"] = expend
            summary_data["total"] = income - expend
            return JsonResponse(summary_data)
    except Exception as result:
        return JsonResponse({"errors": repr(result)}, status=500)
