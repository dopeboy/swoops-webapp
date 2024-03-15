# Generated by Django 4.0.6 on 2022-07-22 21:06

import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0008_auto_20220722_2106"),
    ]

    operations = [
        migrations.AlterField(
            model_name="game",
            name="uuid",
            field=models.UUIDField(default=uuid.uuid4, unique=True),
        ),
    ]
