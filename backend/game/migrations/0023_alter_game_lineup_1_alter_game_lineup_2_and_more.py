# Generated by Django 4.0.5 on 2022-12-08 02:18

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0022_alter_gameplayer_unique_together"),
    ]

    operations = [
        migrations.AlterField(
            model_name="game",
            name="lineup_1",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="+",
                to="game.lineup",
            ),
        ),
        migrations.AlterField(
            model_name="game",
            name="lineup_2",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="+",
                to="game.lineup",
            ),
        ),
        migrations.AlterField(
            model_name="game",
            name="prize_pool",
            field=models.DecimalField(
                blank=True,
                decimal_places=10,
                help_text="Prize Pool",
                max_digits=20,
                null=True,
            ),
        ),
    ]
