from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'properties', views.PropertyViewSet)
router.register(r'rooms', views.RoomViewSet)
router.register(r'topics', views.TopicViewSet)
router.register(r'machines', views.MachineViewSet)
router.register(r'preventive-maintenance', views.PreventiveMaintenanceViewSet)
router.register(r'jobs', views.JobViewSet)
router.register(r'job-attachments', views.JobAttachmentViewSet)
router.register(r'job-checklist', views.JobChecklistItemViewSet)
router.register(r'job-history', views.JobHistoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]