from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch
from .models import Job, JobAttachment, JobChecklistItem, JobHistory
from .serializers import (
    JobSerializer, JobCreateSerializer, JobUpdateSerializer,
    JobAttachmentSerializer, JobChecklistItemSerializer
)
from .filters import JobFilter

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = JobFilter
    search_fields = ['title', 'description', 'notes']
    ordering_fields = ['created_at', 'scheduled_date', 'priority', 'status']
    ordering = ['-created_at']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        try:
            return Job.objects.select_related(
                'property', 'room', 'machine', 'assigned_user', 'creator'
            ).prefetch_related(
                Prefetch('attachments', queryset=JobAttachment.objects.select_related('uploader')),
                Prefetch('checklist', queryset=JobChecklistItem.objects.select_related('completer')),
                Prefetch('history', queryset=JobHistory.objects.select_related('performer'))
            )
        except Exception as e:
            return Job.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return JobCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return JobUpdateSerializer
        return JobSerializer

    def perform_create(self, serializer):
        try:
            serializer.save(created_by=self.request.user.id)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        try:
            job = self.get_object()
            serializer = JobUpdateSerializer(job, data={'assigned_to': request.data.get('assigned_to')}, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        try:
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
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def add_attachment(self, request, pk=None):
        try:
            job = self.get_object()
            serializer = JobAttachmentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(job=job, uploaded_by=request.user.id)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def update_checklist(self, request, pk=None):
        try:
            job = self.get_object()
            checklist_data = request.data.get('checklist', [])
            
            # Delete existing checklist items
            job.checklist.all().delete()
            
            # Create new checklist items
            for item in checklist_data:
                item['job'] = job.id
                serializer = JobChecklistItemSerializer(data=item)
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(self.get_serializer(job).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 