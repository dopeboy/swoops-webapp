# Generated by Django 4.0.5 on 2023-07-25 13:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0047_remove_tournament_reveal_tournament_visibility_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="tournament",
            name="finalize_on",
            field=models.DateTimeField(null=True),
        ),
    ]
