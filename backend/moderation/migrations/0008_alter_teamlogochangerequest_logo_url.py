# Generated by Django 4.0.5 on 2022-10-31 22:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("moderation", "0007_rename_team_id_teamlogochangerequest_team_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="teamlogochangerequest",
            name="logo_url",
            field=models.CharField(blank=True, max_length=256),
        ),
    ]
