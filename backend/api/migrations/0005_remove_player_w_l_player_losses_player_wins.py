# Generated by Django 4.0.6 on 2022-07-18 19:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0004_team_uuid"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="player",
            name="w_l",
        ),
        migrations.AddField(
            model_name="player",
            name="losses",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="player",
            name="wins",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
