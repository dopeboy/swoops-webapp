# Generated by Django 4.0.5 on 2023-04-18 15:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0035_alter_series_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="tournament",
            name="lineup_submission_start",
            field=models.DateTimeField(null=True),
        ),
    ]