# Generated by Django 4.0.5 on 2023-04-06 06:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0029_round_tournament_alter_contest_kind_tournamententry_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tournament",
            name="payout",
            field=models.DecimalField(
                decimal_places=10, default=0.0, help_text="Payout", max_digits=20
            ),
            preserve_default=False,
        ),
    ]