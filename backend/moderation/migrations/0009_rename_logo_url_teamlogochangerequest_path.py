# Generated by Django 4.0.5 on 2022-10-31 22:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("moderation", "0008_alter_teamlogochangerequest_logo_url"),
    ]

    operations = [
        migrations.RenameField(
            model_name="teamlogochangerequest",
            old_name="logo_url",
            new_name="path",
        ),
    ]