from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Topic, Machine, PreventiveMaintenance, Job,
    JobAttachment, JobChecklistItem, JobHistory,
    Property, Room, UserProfile,
    PreventiveMaintenanceMachine, PreventiveMaintenanceTopic
)
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import base64
import uuid

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'is_active', 'is_staff', 'date_joined',
            'last_login'
        ]
        read_only_fields = ['date_joined', 'last_login']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = serializers.JSONField(required=False)
    certifications = serializers.JSONField(required=False)
    emergency_contact = serializers.JSONField(required=False)
    notification_preferences = serializers.JSONField(required=False)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'role', 'department', 'phone_number',
            'profile_image', 'bio', 'skills', 'certifications',
            'emergency_contact', 'preferred_language', 'timezone',
            'notification_preferences', 'is_active', 'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'first_name',
            'last_name', 'phone_number', 'profile'
        ]

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create profile with default values if not provided
        if not profile_data:
            profile_data = {
                'role': 'technician',
                'department': 'maintenance'
            }
        
        UserProfile.objects.create(user=user, **profile_data)
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'phone_number', 'profile'
        ]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update Profile fields
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
            'id', 'property_id', 'name', 'address', 'city', 'state',
            'country', 'postal_code', 'description', 'is_active',
            'created_at', 'updated_at'
        ]

class RoomSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(
        queryset=Property.objects.all(),
        source='property',
        write_only=True
    )

    class Meta:
        model = Room
        fields = [
            'id', 'room_id', 'name', 'description', 'floor', 'area',
            'property', 'property_id', 'is_active', 'created_at', 'updated_at'
        ]

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'title', 'description']

class MachineSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    room = RoomSerializer(read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(
        queryset=Property.objects.all(),
        source='property',
        write_only=True
    )
    room_id = serializers.PrimaryKeyRelatedField(
        queryset=Room.objects.all(),
        source='room',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Machine
        fields = [
            'id', 'machine_id', 'name', 'status', 'property', 'property_id',
            'room', 'room_id', 'maintenance_count', 'next_maintenance_date',
            'last_maintenance_date', 'description', 'is_active', 'procedure',
            'created_at', 'updated_at'
        ]

class JobAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobAttachment
        fields = [
            'id', 'job', 'file_name', 'file_url', 'file_type',
            'file_size', 'uploaded_by', 'uploaded_at'
        ]

class JobChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobChecklistItem
        fields = [
            'id', 'job', 'title', 'description', 'is_completed',
            'completed_at', 'completed_by', 'order'
        ]

class JobHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobHistory
        fields = [
            'id', 'job', 'action', 'description', 'performed_by',
            'performed_at', 'previous_status', 'new_status'
        ]

class JobSerializer(serializers.ModelSerializer):
    attachments = JobAttachmentSerializer(many=True, read_only=True)
    checklist = JobChecklistItemSerializer(many=True, read_only=True)
    history = JobHistorySerializer(many=True, read_only=True)
    property = PropertySerializer(read_only=True)
    room = RoomSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'job_id', 'title', 'description', 'status', 'priority',
            'type', 'assigned_to', 'created_by', 'property', 'room',
            'scheduled_date', 'completed_date', 'estimated_hours',
            'actual_hours', 'cost', 'notes', 'attachments', 'checklist',
            'history', 'created_at', 'updated_at'
        ]

class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'title', 'description', 'priority', 'type', 'property',
            'room', 'scheduled_date', 'estimated_hours', 'notes'
        ]

class JobUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'title', 'description', 'status', 'priority', 'type',
            'assigned_to', 'property', 'room', 'scheduled_date',
            'completed_date', 'estimated_hours', 'actual_hours',
            'cost', 'notes'
        ]

class PreventiveMaintenanceMachineSerializer(serializers.ModelSerializer):
    machine = MachineSerializer(read_only=True)
    machine_id = serializers.PrimaryKeyRelatedField(
        queryset=Machine.objects.all(),
        source='machine',
        write_only=True
    )

    class Meta:
        model = PreventiveMaintenanceMachine
        fields = ['id', 'machine', 'machine_id', 'assigned_at', 'notes']

class PreventiveMaintenanceTopicSerializer(serializers.ModelSerializer):
    topic = TopicSerializer(read_only=True)
    topic_id = serializers.PrimaryKeyRelatedField(
        queryset=Topic.objects.all(),
        source='topic',
        write_only=True
    )

    class Meta:
        model = PreventiveMaintenanceTopic
        fields = ['id', 'topic', 'topic_id', 'assigned_at', 'notes']

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    file_name = serializers.CharField(required=False)
    file_type = serializers.CharField(required=False)

    def validate_file(self, value):
        # Add file validation here (size, type, etc.)
        if value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("File size must be less than 10MB")
        return value

    def save(self, **kwargs):
        file = self.validated_data['file']
        file_name = self.validated_data.get('file_name', file.name)
        file_type = self.validated_data.get('file_type', file.content_type)
        
        # Generate unique filename
        ext = file_name.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{ext}"
        
        # Save file
        path = default_storage.save(f'maintenance_files/{unique_filename}', ContentFile(file.read()))
        return {
            'file_name': file_name,
            'file_url': default_storage.url(path),
            'file_type': file_type,
            'file_size': file.size
        }

class PreventiveMaintenanceSerializer(serializers.ModelSerializer):
    machines = PreventiveMaintenanceMachineSerializer(source='machine_relations', many=True, read_only=True)
    topics = PreventiveMaintenanceTopicSerializer(source='topic_relations', many=True, read_only=True)
    property = PropertySerializer(read_only=True)
    room = RoomSerializer(read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(
        queryset=Property.objects.all(),
        source='property',
        write_only=True
    )
    room_id = serializers.PrimaryKeyRelatedField(
        queryset=Room.objects.all(),
        source='room',
        write_only=True,
        required=False,
        allow_null=True
    )
    before_image = serializers.SerializerMethodField()
    after_image = serializers.SerializerMethodField()

    class Meta:
        model = PreventiveMaintenance
        fields = [
            'id', 'pm_id', 'pmtitle', 'scheduled_date', 'completed_date',
            'frequency', 'custom_days', 'notes', 'before_image_url',
            'after_image_url', 'property', 'property_id', 'room', 'room_id',
            'machines', 'topics', 'status', 'procedure', 'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_before_image(self, obj):
        if obj.before_image:
            return {
                'url': obj.before_image.url,
                'name': obj.before_image.name.split('/')[-1]
            }
        return None

    def get_after_image(self, obj):
        if obj.after_image:
            return {
                'url': obj.after_image.url,
                'name': obj.after_image.name.split('/')[-1]
            }
        return None

class PreventiveMaintenanceCreateSerializer(serializers.ModelSerializer):
    machine_ids = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    topic_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    before_image = serializers.FileField(required=False)
    after_image = serializers.FileField(required=False)

    class Meta:
        model = PreventiveMaintenance
        fields = '__all__'

    def validate_before_image(self, value):
        if value and value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("Before image size must be less than 10MB")
        return value

    def validate_after_image(self, value):
        if value and value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("After image size must be less than 10MB")
        return value

    def create(self, validated_data):
        machine_ids = validated_data.pop('machine_ids', [])
        topic_ids = validated_data.pop('topic_ids', [])
        before_image = validated_data.pop('before_image', None)
        after_image = validated_data.pop('after_image', None)

        # Create the maintenance task
        maintenance = PreventiveMaintenance.objects.create(**validated_data)

        # Handle images
        if before_image:
            ext = before_image.name.split('.')[-1]
            filename = f"before_{maintenance.pm_id}_{uuid.uuid4()}.{ext}"
            maintenance.before_image.save(filename, before_image)

        if after_image:
            ext = after_image.name.split('.')[-1]
            filename = f"after_{maintenance.pm_id}_{uuid.uuid4()}.{ext}"
            maintenance.after_image.save(filename, after_image)

        # Create machine relationships
        for machine_id in machine_ids:
            PreventiveMaintenanceMachine.objects.create(
                maintenance=maintenance,
                machine_id=machine_id
            )

        # Create topic relationships
        for topic_id in topic_ids:
            PreventiveMaintenanceTopic.objects.create(
                maintenance=maintenance,
                topic_id=topic_id
            )

        return maintenance

class PreventiveMaintenanceUpdateSerializer(serializers.ModelSerializer):
    machine_ids = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    topic_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    before_image = serializers.FileField(required=False)
    after_image = serializers.FileField(required=False)

    class Meta:
        model = PreventiveMaintenance
        fields = '__all__'

    def validate_before_image(self, value):
        if value and value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("Before image size must be less than 10MB")
        return value

    def validate_after_image(self, value):
        if value and value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("After image size must be less than 10MB")
        return value

    def update(self, instance, validated_data):
        machine_ids = validated_data.pop('machine_ids', None)
        topic_ids = validated_data.pop('topic_ids', None)
        before_image = validated_data.pop('before_image', None)
        after_image = validated_data.pop('after_image', None)

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Handle images
        if before_image:
            if instance.before_image:
                instance.before_image.delete()
            ext = before_image.name.split('.')[-1]
            filename = f"before_{instance.pm_id}_{uuid.uuid4()}.{ext}"
            instance.before_image.save(filename, before_image)

        if after_image:
            if instance.after_image:
                instance.after_image.delete()
            ext = after_image.name.split('.')[-1]
            filename = f"after_{instance.pm_id}_{uuid.uuid4()}.{ext}"
            instance.after_image.save(filename, after_image)

        instance.save()

        # Update relationships if provided
        if machine_ids is not None:
            instance.machines.clear()
            for machine_id in machine_ids:
                PreventiveMaintenanceMachine.objects.create(
                    maintenance=instance,
                    machine_id=machine_id
                )

        if topic_ids is not None:
            instance.topics.clear()
            for topic_id in topic_ids:
                PreventiveMaintenanceTopic.objects.create(
                    maintenance=instance,
                    topic_id=topic_id
                )

        return instance 