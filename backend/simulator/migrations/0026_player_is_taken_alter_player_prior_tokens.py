# Generated by Django 4.0.5 on 2023-07-18 05:25

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("simulator", "0025_merge_20230718_0524"),
    ]

    operations = [
        migrations.AddField(
            model_name="player",
            name="is_taken",
            field=models.BooleanField(null=True),
        ),
        migrations.AlterField(
            model_name="player",
            name="prior_tokens",
            field=django.contrib.postgres.fields.ArrayField(
                base_field=models.IntegerField(), default=list, size=None
            ),
        ),
    ]
