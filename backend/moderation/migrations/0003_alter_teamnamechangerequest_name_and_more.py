# Generated by Django 4.0.5 on 2022-10-30 14:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("moderation", "0002_remove_teamnamechangerequest_acknowledged"),
    ]

    operations = [
        migrations.AlterField(
            model_name="teamnamechangerequest",
            name="name",
            field=models.TextField(blank=True, db_index=True),
        ),
        migrations.AlterField(
            model_name="teamnamechangerequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("OPEN", "Open"),
                    ("PENDING", "Pending"),
                    ("ACCEPTED", "Accepted"),
                    ("REJECTED", "Rejected"),
                    ("CANCELED", "Canceled"),
                ],
                default="PENDING",
                max_length=12,
            ),
        ),
    ]