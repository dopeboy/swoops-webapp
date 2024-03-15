from django.contrib import admin

import eth.models


class TransferAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "from_address",
        "to_address",
        "token",
    ]


admin.site.register(eth.models.Transfer, TransferAdmin)
