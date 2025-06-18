from django.contrib.admin import AdminSite
from django.utils.translation import gettext_lazy as _

class JobManagementAdminSite(AdminSite):
    # Text to put at the end of each page's <title>.
    site_title = _('Job Management System')

    # Text to put in each page's <h1> (and above login form).
    site_header = _('Job Management Administration')

    # Text to put at the top of the admin index page.
    index_title = _('Job Management Dashboard')

    # URL for the "View site" link at the top of each admin page.
    site_url = '/dashboard'

    def get_app_list(self, request):
        """
        Return a sorted list of all the installed apps that have been
        registered in this site.
        """
        app_list = super().get_app_list(request)

        # Sort the apps alphabetically.
        app_list.sort(key=lambda x: x['name'].lower())

        # Sort the models alphabetically within each app.
        for app in app_list:
            app['models'].sort(key=lambda x: x['name'])

        return app_list

# Create the custom admin site instance
job_admin_site = JobManagementAdminSite(name='job_admin')

# Register the models with the custom admin site
from .admin import (
    JobAdmin, JobAttachmentAdmin,
    JobChecklistItemAdmin, JobHistoryAdmin
)
from .models import Job, JobAttachment, JobChecklistItem, JobHistory

job_admin_site.register(Job, JobAdmin)
job_admin_site.register(JobAttachment, JobAttachmentAdmin)
job_admin_site.register(JobChecklistItem, JobChecklistItemAdmin)
job_admin_site.register(JobHistory, JobHistoryAdmin) 