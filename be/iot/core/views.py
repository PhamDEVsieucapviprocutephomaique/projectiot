from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import DataSensor, HistoryAction
from .serializers import DataSensorSerializer, HistoryActionSerializer
from django.utils.timezone import localtime
import json
import paho.mqtt.publish as publish
# API lấy tất cả dữ liệu sensor
class DataSensorViewSet(viewsets.ModelViewSet):
    queryset = DataSensor.objects.all().order_by('-time')
    serializer_class = DataSensorSerializer

# # API lấy tất cả history action
class HistoryActionViewSet(viewsets.ModelViewSet):
    queryset = HistoryAction.objects.all().order_by('-time')
    serializer_class = HistoryActionSerializer

# API custom: lấy sensor mới nhất
@api_view(['GET'])
def get_latest_sensor(request):
    latest = DataSensor.objects.order_by('-time').first()  # lấy bản ghi mới nhất theo time
    if latest:
        serializer = DataSensorSerializer(latest)   
        return Response(serializer.data)
    return Response({"detail": "No data found."}, status=404)


last_device_data = {}

@api_view(['POST', 'GET'])
def control_device(request):
    global last_device_data
    
    if request.method == 'POST':
        data = json.loads(request.body)
        last_device_data = data
        publish.single("device", 
            payload=json.dumps(data), 
            hostname="broker.hivemq.com")
        return Response({"data": data})

    elif request.method == 'GET':
        return Response({
            "data": last_device_data
        })