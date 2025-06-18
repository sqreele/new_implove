from rest_framework import serializers
from django.utils import timezone
from .models import Job, JobAttachment, JobChecklistItem, JobHistory

class JobAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobAttachment
        fields = ['id', 'file_name', 'file_url', 'file_type', 'file_size', 'uploaded_at']
        read_only_fields = ['uploaded_at']

    def validate_file_size(self, value):
        if value > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("File size must be less than 10MB")
        return value

class JobChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobChecklistItem
        fields = ['id', 'title', 'description', 'is_completed', 'completed_at', 'order']
        read_only_fields = ['completed_at']

    def validate(self, data):
        if data.get('is_completed') and not data.get('completed_at'):
            data['completed_at'] = timezone.now()
        return data

class JobHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobHistory
        fields = ['id', 'action', 'description', 'performed_at', 'previous_status', 'new_status']
        read_only_fields = ['performed_at']

class JobSerializer(serializers.ModelSerializer):
    attachments = JobAttachmentSerializer(many=True, read_only=True)
    checklist = JobChecklistItemSerializer(many=True, read_only=True)
    history = JobHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 'job_id', 'title', 'description', 'status', 'priority', 'type',
            'assigned_to', 'created_by', 'property_id', 'property_name',
            'room_id', 'room_name', 'machine_id', 'scheduled_date',
            'completed_date', 'estimated_hours', 'actual_hours', 'cost',
            'notes', 'created_at', 'updated_at', 'attachments', 'checklist', 'history'
        ]
        read_only_fields = ['created_at', 'updated_at', 'job_id']

    def validate_scheduled_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Scheduled date cannot be in the past")
        return value

    def validate_completed_date(self, value):
        if value and value < self.instance.scheduled_date:
            raise serializers.ValidationError("Completion date cannot be before scheduled date")
        return value

class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'title', 'description', 'priority', 'type', 'property_id',
            'room_id', 'machine_id', 'scheduled_date', 'estimated_hours',
            'notes', 'checklist'
        ]

    def validate(self, data):
        if data.get('scheduled_date') < timezone.now():
            raise serializers.ValidationError("Scheduled date cannot be in the past")
        return data

class JobUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'title', 'description', 'status', 'priority', 'type',
            'assigned_to', 'property_id', 'room_id', 'machine_id',
            'scheduled_date', 'completed_date', 'estimated_hours',
            'actual_hours', 'cost', 'notes'
        ]

    def validate(self, data):
        if data.get('completed_date') and data.get('scheduled_date'):
            if data['completed_date'] < data['scheduled_date']:
                raise serializers.ValidationError("Completion date cannot be before scheduled date")
        return data 