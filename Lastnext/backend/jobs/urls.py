from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet
from .admin_site import job_admin_site

router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='job')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', job_admin_site.urls),
] 