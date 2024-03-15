# Generated by Django 4.0.5 on 2023-08-24 05:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("simulator", "0031_alter_historicalplayerstats_player_token"),
    ]

    operations = [
        migrations.AlterField(
            model_name="historicalplayerstats",
            name="player_canonical",
            field=models.CharField(max_length=128),
        ),
        migrations.AlterField(
            model_name="historicalplayerstats",
            name="player_uuid",
            field=models.UUIDField(),
        ),
    ]