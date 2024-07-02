# 用户文档

## 1.安装依赖

安装对应的库

## 2.设置数据库

* 在`booksales/settings.py`内设置使用的数据库，这里应使用MySQL

* 初始化数据库
  * 在MySQL中运行`source (路径)/init.sql`
  * 在项目目录下运行`python manage.py migrate`,进行数据库的迁移

* 创建超级用户
  * 在项目目录下运行`python manage.py createsuperuser`，并键入管理员信息

## 3.运行与测试

* 在项目目录下运行`python manage.py runserver`
* 在浏览器中打开(http://127.0.0.1:8000/front/)
* 使用超级用户的账号密码登录
* 在MySQL中运行`source (路径)/testdata.sql`，导入图书、库存、订单信息（请首先在用户管理界面创建一个“用户”类型）