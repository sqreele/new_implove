from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Job, JobAttachment, JobChecklistItem, JobHistory

class JobAttachmentInline(admin.TabularInline):
    model = JobAttachment
    extra = 0
    readonly_fields = ['uploaded_at']
    fields = ['file_name', 'file_url', 'file_type', 'file_size', 'uploaded_at']

class JobChecklistItemInline(admin.TabularInline):
    model = JobChecklistItem
    extra = 0
    readonly_fields = ['completed_at']
    fields = ['title', 'description', 'is_completed', 'completed_at', 'order']

class JobHistoryInline(admin.TabularInline):
    model = JobHistory
    extra = 0
    readonly_fields = ['performed_at']
    fields = ['action', 'description', 'performed_at', 'previous_status', 'new_status']

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = [
        'job_id', 'title', 'status', 'priority', 'type',
        'property_name', 'room_name', 'scheduled_date',
        'assigned_to', 'created_at', 'get_status_badge'
    ]
    list_filter = [
        'status', 'priority', 'type', 'created_at',
        'scheduled_date', 'completed_date'
    ]
    search_fields = [
        'job_id', 'title', 'description', 'notes',
        'property_name', 'room_name'
    ]
    readonly_fields = [
        'job_id', 'created_at', 'updated_at',
        'property_name', 'room_name'
    ]
    inlines = [JobAttachmentInline, JobChecklistItemInline, JobHistoryInline]
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'job_id', 'title', 'description', 'status',
                'priority', 'type', 'notes'
            )
        }),
        ('Assignment', {
            'fields': (
                'assigned_to', 'created_by', 'property_id',
                'property_name', 'room_id', 'room_name',
                'machine_id'
            )
        }),
        ('Schedule & Completion', {
            'fields': (
                'scheduled_date', 'completed_date',
                'estimated_hours', 'actual_hours', 'cost'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_status_badge(self, obj):
        colors = {
            'pending': 'gray',
            'in_progress': 'blue',
            'completed': 'green',
            'cancelled': 'red',
            'on_hold': 'orange'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; border-radius: 5px;">{}</span>',
            color,
            obj.status
        )
    get_status_badge.short_description = 'Status'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'property', 'room', 'machine', 'assigned_user', 'creator'
        )

@admin.register(JobAttachment)
class JobAttachmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'job', 'file_name', 'file_type', 'file_size', 'uploaded_at']
    list_filter = ['file_type', 'uploaded_at']
    search_fields = ['file_name', 'job__title']
    readonly_fields = ['uploaded_at']

@admin.register(JobChecklistItem)
class JobChecklistItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'job', 'title', 'is_completed', 'completed_at', 'order']
    list_filter = ['is_completed', 'completed_at']
    search_fields = ['title', 'description', 'job__title']
    readonly_fields = ['completed_at']

@admin.register(JobHistory)
class JobHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'job', 'action', 'performed_at', 'previous_status', 'new_status']
    list_filter = ['action', 'performed_at', 'previous_status', 'new_status']
    search_fields = ['description', 'job__title']
    readonly_fields = ['performed_at']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('job', 'performer') 