# Generated by Django 4.0.5 on 2023-08-01 20:28

import json

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0050_tournament_number_of_payouts"),
    ]

    def populate_number_of_payouts(apps, schema_editor):
        Tournament = apps.get_model("game", "Tournament")
        for tournament in Tournament.objects.all():
            if json.loads(tournament.meta).get("payout_breakdown_usd"):
                tournament.number_of_payouts = len(
                    json.loads(tournament.meta)["payout_breakdown_usd"]
                )
                tournament.save()

    operations = [
        migrations.RunPython(populate_number_of_payouts),
    ]