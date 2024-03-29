# Generated by Django 4.0.5 on 2023-08-16 21:34

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0053_tournament_paid_out_alter_payout_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="tournament",
            name="banner_img_url",
            field=models.CharField(
                blank=True, help_text="Image URL for tournament", max_length=255
            ),
        ),
    ]
