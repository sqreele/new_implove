from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from django.utils import timezone
from .models import (
    User, UserProfile, Topic, Machine, PreventiveMaintenance, Job,
    JobAttachment, JobChecklistItem, JobHistory, Property, Room
)
from .serializers import (
    UserSerializer, UserProfileSerializer, UserCreateSerializer, UserUpdateSerializer,
    TopicSerializer, MachineSerializer, PreventiveMaintenanceSerializer,
    JobSerializer, JobAttachmentSerializer, JobChecklistItemSerializer,
    JobHistorySerializer, JobCreateSerializer, JobUpdateSerializer,
    PreventiveMaintenanceCreateSerializer, PreventiveMaintenanceUpdateSerializer,
    PropertySerializer, RoomSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        user = self.get_object()
        serializer = UserProfileSerializer(user.profile)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        user = self.get_object()
        stats = {
            'assigned_jobs': user.assigned_jobs.count(),
            'completed_jobs': user.assigned_jobs.filter(status='completed').count(),
            'created_jobs': user.created_jobs.count(),
            'job_completion_rate': (
                user.assigned_jobs.filter(status='completed').count() /
                user.assigned_jobs.count() * 100
                if user.assigned_jobs.count() > 0 else 0
            ),
            'recent_activity': user.assigned_jobs.order_by('-updated_at')[:5].values(
                'job_id', 'title', 'status', 'updated_at'
            ),
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'property_id', 'is_active']
    search_fields = ['name', 'description', 'machine_id']

class PreventiveMaintenanceViewSet(viewsets.ModelViewSet):
    queryset = PreventiveMaintenance.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'frequency', 'property_id']
    search_fields = ['pmtitle', 'notes']

    def get_serializer_class(self):
        if self.action == 'create':
            return PreventiveMaintenanceCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PreventiveMaintenanceUpdateSerializer
        return PreventiveMaintenanceSerializer

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        total = self.queryset.count()
        completed = self.queryset.filter(status='completed').count()
        pending = self.queryset.filter(status='pending').count()
        overdue = self.queryset.filter(status='overdue').count()

        frequency_distribution = (
            self.queryset.values('frequency')
            .annotate(count=Count('id'))
            .order_by('frequency')
        )

        machine_distribution = (
            Machine.objects.values('machine_id', 'name')
            .annotate(count=Count('maintenance_tasks'))
            .order_by('-count')
        )

        return Response({
            'counts': {
                'total': total,
                'completed': completed,
                'pending': pending,
                'overdue': overdue
            },
            'frequency_distribution': frequency_distribution,
            'machine_distribution': machine_distribution,
            'completion_rate': (completed / total * 100) if total > 0 else 0
        })

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'priority', 'type', 'property_id', 'assigned_to']
    search_fields = ['title', 'description', 'notes']

    def get_serializer_class(self):
        if self.action == 'create':
            return JobCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return JobUpdateSerializer
        return JobSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        job = self.get_object()
        serializer = JobUpdateSerializer(job, data={
            'status': 'completed',
            'completed_date': request.data.get('completed_date'),
            'actual_hours': request.data.get('actual_hours'),
            'cost': request.data.get('cost'),
            'notes': request.data.get('notes')
        }, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            JobHistory.objects.create(
                job=job,
                action='completed',
                description=f'Job completed by {request.user.username}',
                performed_by=request.user,
                previous_status=job.status,
                new_status='completed'
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobAttachmentViewSet(viewsets.ModelViewSet):
    queryset = JobAttachment.objects.all()
    serializer_class = JobAttachmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['job', 'uploaded_by']

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class JobChecklistItemViewSet(viewsets.ModelViewSet):
    queryset = JobChecklistItem.objects.all()
    serializer_class = JobChecklistItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['job', 'is_completed']

    def perform_update(self, serializer):
        if serializer.validated_data.get('is_completed'):
            serializer.save(completed_by=self.request.user)
        else:
            serializer.save()

class JobHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobHistory.objects.all()
    serializer_class = JobHistorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['job', 'performed_by', 'action']

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_active']
    search_fields = ['name', 'property_id', 'address', 'city', 'state', 'country']

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        property = self.get_object()
        stats = {
            'total_rooms': property.rooms.count(),
            'active_rooms': property.rooms.filter(is_active=True).count(),
            'total_machines': property.machines.count(),
            'active_machines': property.machines.filter(is_active=True).count(),
            'total_jobs': property.jobs.count(),
            'completed_jobs': property.jobs.filter(status='completed').count(),
            'total_maintenance': property.maintenance_tasks.count(),
            'completed_maintenance': property.maintenance_tasks.filter(completed_date__isnull=False).count(),
        }
        return Response(stats)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['property', 'is_active', 'floor']
    search_fields = ['name', 'room_id', 'description']

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        room = self.get_object()
        stats = {
            'total_machines': room.machines.count(),
            'active_machines': room.machines.filter(is_active=True).count(),
            'total_jobs': room.jobs.count(),
            'completed_jobs': room.jobs.filter(status='completed').count(),
            'total_maintenance': room.maintenance_tasks.count(),
            'completed_maintenance': room.maintenance_tasks.filter(completed_date__isnull=False).count(),
        }
        return Response(stats)