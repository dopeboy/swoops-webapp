from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import Tutorial, User


class SessionAdmin(admin.ModelAdmin):
    def _session_data(self, obj):
        return obj.get_decoded()

    list_display = ["session_key", "_session_data", "expire_date"]


class MyUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        fields = ("email",)
        model = User


class MyUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("email", "password")


class CustomUserAdmin(UserAdmin):
    list_display = ("id", "email", "is_active", "is_staff")
    ordering = ("email",)
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "wallet_address",
                    "email",
                    "password",
                    "email_verification_token",
                    "is_verified",
                    "tutorial",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                ),
            },
        ),
    )
    list_display = (
        "id",
        "email",
        "date_joined",
        "email_verification_token",
        "is_staff",
    )
    ordering = ("-date_joined",)


admin.site.register(User, CustomUserAdmin)


class TutorialAdmin(admin.ModelAdmin):
    list_display = (
        "__str__",
        "get_user_email",
        "get_team",
        "version",
        "get_next_step_number",
        "completed_at",
        "created_at",
    )
    ordering = ("-created_at",)
    change_form_template = "admin/tutorial_change_form.html"
    readonly_fields = (
        "get_user_email",
        "get_team",
        "version",
        "get_next_step_number",
        "created_at",
    )

    @admin.display(ordering="user__email", description="User email")
    def get_user_email(self, obj):
        return obj.user.email

    @admin.display(ordering="team__name", description="Team")
    def get_team(self, obj):
        return obj.user.team.name

    @admin.display(ordering="tutorial_next_step_num", description="Next step")
    def get_next_step_number(self, obj):
        return obj.get_next_step_number()

    def response_change(self, request, tutorial):
        if "_reset" in request.POST:
            tutorial.reset()

        return super(TutorialAdmin, self).response_change(request, tutorial)


admin.site.register(Tutorial, TutorialAdmin)
