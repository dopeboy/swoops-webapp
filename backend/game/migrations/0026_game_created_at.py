# Generated by Django 4.0.5 on 2023-01-04 23:41

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0025_drop_player_ownership_view"),
    ]

    operations = [
        migrations.AddField(
            model_name="game",
            name="created_at",
            field=models.DateTimeField(
                auto_now_add=True, db_index=True, default=django.utils.timezone.now
            ),
            preserve_default=False,
        ),
    ]