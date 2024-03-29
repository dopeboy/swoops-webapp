# Generated by Django 4.0.5 on 2022-08-03 20:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0010_delete_lineup"),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name="gamemembership",
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name="gamemembership",
            name="game",
        ),
        migrations.RemoveField(
            model_name="gamemembership",
            name="owner",
        ),
        migrations.RemoveField(
            model_name="gamemembership",
            name="player",
        ),
        migrations.RemoveField(
            model_name="gamemembership",
            name="team",
        ),
        migrations.RemoveField(
            model_name="player",
            name="owner",
        ),
        migrations.RemoveField(
            model_name="team",
            name="owner",
        ),
        migrations.AlterUniqueTogether(
            name="userplayernote",
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name="userplayernote",
            name="player",
        ),
        migrations.RemoveField(
            model_name="userplayernote",
            name="user",
        ),
        migrations.DeleteModel(
            name="Game",
        ),
        migrations.DeleteModel(
            name="GameMembership",
        ),
        migrations.DeleteModel(
            name="Player",
        ),
        migrations.DeleteModel(
            name="Team",
        ),
        migrations.DeleteModel(
            name="UserPlayerNote",
        ),
    ]
