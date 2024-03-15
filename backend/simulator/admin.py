from django.contrib import admin

import simulator.models


class ReadOnlyModelAdmin(admin.ModelAdmin):
    def get_readonly_fields(self, request, obj=None):
        return [f.name for f in obj._meta.fields]

    def has_add_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


class PlayerAdmin(ReadOnlyModelAdmin):
    list_display = ["uuid", "token", "full_name"]


class SimulationAdmin(ReadOnlyModelAdmin):
    list_display = [
        "created_at",
        "uuid",
        "status",
        "updated_at",
        "error_msg",
        "num_retries",
        "next_retry_at",
    ]


class PlayerProgressionAdmin(admin.ModelAdmin):
    list_display = ("player",)
    list_filter = ("created_at",)
    search_fields = ("player__name",)


admin.site.register(simulator.models.PlayerProgression, PlayerProgressionAdmin)
