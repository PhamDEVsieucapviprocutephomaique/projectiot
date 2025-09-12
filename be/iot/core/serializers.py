from rest_framework import serializers
from .models import DataSensor
from .models import HistoryAction

class DataSensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSensor
        fields = '__all__'
        # Hoặc chỉ định cụ thể các field:
        # fields = ['id', 'temperature', 'humidity', 'light', 'time']


class HistoryActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoryAction
        fields = '__all__'
        # Hoặc chỉ định cụ thể các field:
        # fields = ['id', 'device', 'action', 'time']