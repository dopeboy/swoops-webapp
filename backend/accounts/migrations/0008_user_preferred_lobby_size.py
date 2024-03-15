# Generated by Django 4.0.5 on 2023-08-08 17:57

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0007_tutorial_step_800_completed_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="preferred_lobby_size",
            field=models.PositiveIntegerField(
                default=1, help_text="user's perferred lobby size"
            ),
        ),
    ]
