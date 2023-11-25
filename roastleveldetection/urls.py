from django.contrib import admin
from django.urls import path
from website.views import views, detection
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views),
    path('detection/', detection),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
