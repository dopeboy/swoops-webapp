# Generated by Django 4.0.5 on 2022-09-09 17:06

import django.db.models.expressions
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("simulator", "0002_alter_player_defensive_iq_alter_player_dribbling_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="player",
            name="position",
        ),
        migrations.AddField(
            model_name="player",
            name="position_1",
            field=models.CharField(
                choices=[
                    ("guard", "Guard"),
                    ("forward", "Forward"),
                    ("center", "Center"),
                ],
                max_length=20,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="player",
            name="position_2",
            field=models.CharField(
                choices=[
                    ("guard", "Guard"),
                    ("forward", "Forward"),
                    ("center", "Center"),
                ],
                max_length=20,
                null=True,
            ),
        ),
        migrations.AddConstraint(
            model_name="player",
            constraint=models.CheckConstraint(
                check=models.Q(
                    models.Q(
                        ("position_1", django.db.models.expressions.F("position_2")),
                        ("position_2", django.db.models.expressions.F("position_1")),
                    ),
                    _negated=True,
                ),
                name="simulator_player_position_should_not_equal",
            ),
        ),
    ]
