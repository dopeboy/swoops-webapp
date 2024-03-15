# Generated by Django 4.0.5 on 2023-08-24 05:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0008_user_preferred_lobby_size"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="preferred_lobby_size",
            field=models.PositiveIntegerField(
                default=1, help_text="user's preferred lobby size"
            ),
        ),
    ]