# Generated by Django 4.0.5 on 2022-11-28 20:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0016_alter_game_simulation"),
    ]

    operations = [
        migrations.AlterField(
            model_name="contest",
            name="status",
            field=models.CharField(
                choices=[
                    ("OPEN", "Open"),
                    ("COMPLETE", "Complete"),
                    ("IN_PROGRESS", "In Progress"),
                    ("ERROR", "Error"),
                ],
                default="OPEN",
                max_length=12,
            ),
        ),
    ]
