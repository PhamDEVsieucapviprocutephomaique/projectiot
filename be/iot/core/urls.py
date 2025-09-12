from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DataSensorViewSet, HistoryActionViewSet
from .views import get_latest_sensor,control_device

router = DefaultRouter()
router.register(r'datasensor', DataSensorViewSet, basename='datasensor')
router.register(r'historyaction', HistoryActionViewSet, basename='historyaction')

urlpatterns = [
    path('device/', control_device),
    path('datasensor/latest/',get_latest_sensor),
    path('', include(router.urls)),

]
