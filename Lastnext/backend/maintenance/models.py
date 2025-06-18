from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class Topic(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Property(models.Model):
    property_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.property_id})"

class Room(models.Model):
    room_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    floor = models.CharField(max_length=50)
    area = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='rooms')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.property.name}"

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('technician', 'Technician'),
        ('supervisor', 'Supervisor'),
    ]

    DEPARTMENT_CHOICES = [
        ('maintenance', 'Maintenance'),
        ('operations', 'Operations'),
        ('management', 'Management'),
        ('support', 'Support'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    emergency_contact = models.JSONField(default=dict, blank=True)
    preferred_language = models.CharField(max_length=10, default='en')
    timezone = models.CharField(max_length=50, default='UTC')
    notification_preferences = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(
            user=instance,
            role='technician',  # Default role
            department='maintenance'  # Default department
        )

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class Machine(models.Model):
    machine_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='active')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='machines')
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='machines')
    maintenance_count = models.IntegerField(default=0)
    next_maintenance_date = models.DateField(null=True, blank=True)
    last_maintenance_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    procedure = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.machine_id})"

class PreventiveMaintenance(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('biweekly', 'Biweekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('biannually', 'Biannually'),
        ('annually', 'Annually'),
        ('custom', 'Custom'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
    ]

    pm_id = models.CharField(max_length=50, unique=True)
    pmtitle = models.CharField(max_length=200)
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    custom_days = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='maintenance_tasks')
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_tasks')
    machines = models.ManyToManyField(Machine, related_name='maintenance_tasks')
    topics = models.ManyToManyField(Topic, related_name='maintenance_tasks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    procedure = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.pmtitle} ({self.pm_id})"

class Job(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('on_hold', 'On Hold'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    TYPE_CHOICES = [
        ('maintenance', 'Maintenance'),
        ('repair', 'Repair'),
        ('inspection', 'Inspection'),
        ('installation', 'Installation'),
        ('other', 'Other'),
    ]

    job_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_jobs')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_jobs')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='jobs')
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs')
    property_name = models.CharField(max_length=100, blank=True, null=True)
    room_id = models.CharField(max_length=50, blank=True, null=True)
    room_name = models.CharField(max_length=100, blank=True, null=True)
    machine_id = models.CharField(max_length=50, blank=True, null=True)
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.job_id})"

class JobAttachment(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='attachments')
    file_name = models.CharField(max_length=255)
    file_url = models.URLField()
    file_type = models.CharField(max_length=50)
    file_size = models.IntegerField()
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} - {self.job.title}"

class JobChecklistItem(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='checklist')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='completed_checklist_items')
    order = models.IntegerField()

    def __str__(self):
        return f"{self.title} - {self.job.title}"

class JobHistory(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=100)
    description = models.TextField()
    performed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    performed_at = models.DateTimeField(auto_now_add=True)
    previous_status = models.CharField(max_length=20, choices=Job.STATUS_CHOICES, null=True, blank=True)
    new_status = models.CharField(max_length=20, choices=Job.STATUS_CHOICES, null=True, blank=True)

    def __str__(self):
        return f"{self.action} - {self.job.title}" 