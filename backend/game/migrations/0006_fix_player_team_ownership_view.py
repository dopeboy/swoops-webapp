from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0005_alter_reservationsnapshot_expires_at_and_more"),
    ]

    operations = [
        migrations.RunSQL(
            """
            DROP VIEW player_team_ownership;
            """
        ),
        migrations.RunSQL(
            """
            CREATE OR REPLACE VIEW player_team_ownership AS
            SELECT
                gp.id AS player_id,
                owner.id AS owner_id,
                team.id AS team_id
            FROM eth_transfer et
            INNER JOIN (
                SELECT
                    token AS token,
                    max(block) AS max_block
                FROM eth_transfer
                GROUP BY token
            ) mbt ON et.token = mbt.token AND mbt.max_block = et.block
            JOIN simulator_player sp ON sp.token = et.token
            JOIN game_player gp ON gp.simulated_id = sp.uuid
            JOIN accounts_user owner ON owner.wallet_address = et.to_address
            JOIN game_team team ON owner.id = team.owner_id;
		    """
        ),
    ]
