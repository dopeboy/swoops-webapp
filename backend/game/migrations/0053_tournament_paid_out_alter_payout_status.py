# Generated by Django 4.0.5 on 2023-08-09 21:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0052_payout_alter_tournament_finalized_on_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="tournament",
            name="paid_out",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="payout",
            name="status",
            field=models.CharField(
                choices=[
                    ("INITIATED", "Initiated"),
                    ("CONFIRMED", "Confirmed"),
                    ("SUPERSEDED", "Superseded"),
                    ("ERRORED", "Errored"),
                ],
                default="INITIATED",
                max_length=10,
            ),
        ),
    ]
