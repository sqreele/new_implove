import django_filters
from django.utils import timezone
from datetime import datetime
from .models import Job

class JobFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')
    description = django_filters.CharFilter(lookup_expr='icontains')
    status = django_filters.CharFilter()
    priority = django_filters.CharFilter()
    type = django_filters.CharFilter()
    assigned_to = django_filters.CharFilter()
    property_id = django_filters.CharFilter()
    room_id = django_filters.CharFilter()
    machine_id = django_filters.CharFilter()
    scheduled_date_after = django_filters.DateFilter(field_name='scheduled_date', lookup_expr='gte')
    scheduled_date_before = django_filters.DateFilter(field_name='scheduled_date', lookup_expr='lte')
    created_at_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_at_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')

    def filter_scheduled_date_after(self, queryset, name, value):
        try:
            return queryset.filter(scheduled_date__gte=value)
        except (ValueError, TypeError):
            return queryset.none()

    def filter_scheduled_date_before(self, queryset, name, value):
        try:
            return queryset.filter(scheduled_date__lte=value)
        except (ValueError, TypeError):
            return queryset.none()

    def filter_created_at_after(self, queryset, name, value):
        try:
            return queryset.filter(created_at__gte=value)
        except (ValueError, TypeError):
            return queryset.none()

    def filter_created_at_before(self, queryset, name, value):
        try:
            return queryset.filter(created_at__lte=value)
        except (ValueError, TypeError):
            return queryset.none()

    class Meta:
        model = Job
        fields = {
            'status': ['exact'],
            'priority': ['exact'],
            'type': ['exact'],
            'assigned_to': ['exact'],
            'property_id': ['exact'],
            'room_id': ['exact'],
            'machine_id': ['exact'],
        } 