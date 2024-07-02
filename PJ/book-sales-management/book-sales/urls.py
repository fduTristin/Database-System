from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('front/', include('front.urls')),
    path('backend/', include('backend.urls')),
    path('admin/', admin.site.urls),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

handler404 = 'front.views.not_found'  # 由于使用了DEBUG=True,实际上这个404页面不会被显示，但是还是配置上了
