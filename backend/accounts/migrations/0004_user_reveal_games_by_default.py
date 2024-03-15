# Generated by Django 4.0.5 on 2023-03-02 17:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_alter_user_wallet_address"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="reveal_games_by_default",
            field=models.BooleanField(
                default=False,
                help_text="Reveal all game scores by default.",
                verbose_name="reveal_games_by_default",
            ),
        ),
    ]
