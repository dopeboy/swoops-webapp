from django.core.exceptions import ObjectDoesNotExist
from django.db import models

import simulator.models


class AllTimePlayerStatsViewMixin(models.Model):
    player_id = models.UUIDField(primary_key=True)
    count = models.IntegerField()
    wins = models.IntegerField()
    losses = models.IntegerField()
    fg = models.FloatField()
    ft = models.FloatField()
    fpg = models.FloatField()
    apg = models.FloatField()
    bpg = models.FloatField()
    drpg = models.FloatField()
    fga = models.FloatField()
    fta = models.FloatField()
    orpg = models.FloatField()
    ppg = models.FloatField()
    spg = models.FloatField()
    tpg = models.FloatField()
    rpg = models.FloatField()
    two_p = models.FloatField()
    two_pa = models.FloatField()
    three_p = models.FloatField()
    three_pa = models.FloatField()
    fg_total = models.FloatField()
    ft_total = models.FloatField()
    fpg_total = models.FloatField()
    apg_total = models.FloatField()
    bpg_total = models.FloatField()
    drpg_total = models.FloatField()
    fga_total = models.FloatField()
    fta_total = models.FloatField()
    orpg_total = models.FloatField()
    ppg_total = models.FloatField()
    spg_total = models.FloatField()
    tpg_total = models.FloatField()
    rpg_total = models.FloatField()
    two_p_total = models.FloatField()
    two_pa_total = models.FloatField()
    three_p_total = models.FloatField()
    three_pa_total = models.FloatField()
    fg_pct = models.FloatField(null=True)
    ft_pct = models.FloatField(null=True)
    two_p_pct = models.FloatField(null=True)
    three_p_pct = models.FloatField(null=True)
    ts_pct = models.FloatField(null=True)

    class Meta:
        abstract = True


class AllTimePlayerStatsView(AllTimePlayerStatsViewMixin):
    class Meta:
        managed = False
        db_table = "view_all_time_player_stats"


class AllTimePlayerStatsViewOneToken(AllTimePlayerStatsViewMixin):
    class Meta:
        managed = False
        db_table = "view_all_time_player_stats_1_token"


class AllTimePlayerStatsViewThreeTokens(AllTimePlayerStatsViewMixin):
    class Meta:
        managed = False
        db_table = "view_all_time_player_stats_3_tokens"


class AllTimePlayerStatsViewFiveTokens(AllTimePlayerStatsViewMixin):
    class Meta:
        managed = False
        db_table = "view_all_time_player_stats_5_tokens"


class CurrentSeasonPlayerStatsViewMixin(models.Model):
    player_id = models.UUIDField(primary_key=True)
    count = models.IntegerField()
    wins = models.IntegerField()
    losses = models.IntegerField()
    fg = models.FloatField()
    ft = models.FloatField()
    fpg = models.FloatField()
    apg = models.FloatField()
    bpg = models.FloatField()
    drpg = models.FloatField()
    fga = models.FloatField()
    fta = models.FloatField()
    orpg = models.FloatField()
    ppg = models.FloatField()
    spg = models.FloatField()
    tpg = models.FloatField()
    rpg = models.FloatField()
    two_p = models.FloatField()
    two_pa = models.FloatField()
    three_p = models.FloatField()
    three_pa = models.FloatField()
    fg_total = models.FloatField()
    ft_total = models.FloatField()
    fpg_total = models.FloatField()
    apg_total = models.FloatField()
    bpg_total = models.FloatField()
    drpg_total = models.FloatField()
    fga_total = models.FloatField()
    fta_total = models.FloatField()
    orpg_total = models.FloatField()
    ppg_total = models.FloatField()
    spg_total = models.FloatField()
    tpg_total = models.FloatField()
    rpg_total = models.FloatField()
    two_p_total = models.FloatField()
    two_pa_total = models.FloatField()
    three_p_total = models.FloatField()
    three_pa_total = models.FloatField()
    fg_pct = models.FloatField(null=True)
    ft_pct = models.FloatField(null=True)
    two_p_pct = models.FloatField(null=True)
    three_p_pct = models.FloatField(null=True)
    ts_pct = models.FloatField(null=True)

    class Meta:
        abstract = True


class CurrentSeasonPlayerStatsView(CurrentSeasonPlayerStatsViewMixin):
    class Meta:
        managed = False
        db_table = "view_current_season_player_stats"


class CurrentSeasonPlayerStatsViewOneToken(CurrentSeasonPlayerStatsViewMixin):
    class Meta:
        managed = False
        db_table = "view_current_season_player_stats_1_token"


class CurrentSeasonPlayerStatsViewThreeTokens(CurrentSeasonPlayerStatsViewMixin):
    class Meta:
        managed = False
        db_table = "view_current_season_player_stats_3_tokens"


class CurrentSeasonPlayerStatsViewFiveTokens(CurrentSeasonPlayerStatsViewMixin):
    class Meta:
        managed = False
        db_table = "view_current_season_player_stats_5_tokens"


class PlayerStatsViewManager(models.Manager):
    def by_player_uuid(self, player_id):
        try:
            return self.get(player_id=player_id)
        except ObjectDoesNotExist:
            return None

    def by_player_token(self, player_token):
        player = simulator.models.Player.objects.get(token=player_token)
        try:
            return self.get(player_id=player.uuid)
        except ObjectDoesNotExist:
            return None

    def by_player_canonical(self, player_canonical):
        player = simulator.models.Player.objects.get(canonical=player_canonical)
        try:
            return self.get(player_id=player.uuid)
        except ObjectDoesNotExist:
            return None


class AllTimePlayerStatsViewProxy(AllTimePlayerStatsView):
    class Meta:
        proxy = True

    objects = PlayerStatsViewManager()


class CurrentSeasonPlayerStatsViewProxy(CurrentSeasonPlayerStatsView):
    class Meta:
        proxy = True

    objects = PlayerStatsViewManager()


class AllTimePlayerStatsViewProxyOneToken(AllTimePlayerStatsViewOneToken):
    class Meta:
        proxy = True

    objects = PlayerStatsViewManager()


class CurrentSeasonPlayerStatsViewProxyOneToken(CurrentSeasonPlayerStatsViewOneToken):
    class Meta:
        proxy = True

    objects = PlayerStatsViewManager()


class AllTimePlayerStatsViewProxyThreeTokens(AllTimePlayerStatsViewThreeTokens):
    class Meta:
        proxy = True

    objects = PlayerStatsViewManager()


class CurrentSeasonPlayerStatsViewProxyThreeTokens(
    CurrentSeasonPlayerStatsViewThreeTokens
):
    class Meta:
        proxy = True

    objects = PlayerStatsViewManager()


class AllTimePlayerStatsViewProxyFiveTokens(AllTimePlayerStatsViewFiveTokens):
    class Meta:
        proxy = True

    objects = PlayerStatsViewManager()


class CurrentSeasonPlayerStatsViewProxyFiveTokens(
    CurrentSeasonPlayerStatsViewFiveTokens
):
    class Meta:
        proxy = True

    objects = PlayerStatsViewManager()


class TeamStatsViewManager(models.Manager):
    def by_team_id(self, team_id):
        try:
            return self.get(team_id=team_id)
        except ObjectDoesNotExist:
            return None


class CurrentSeasonTeamSPView(models.Model):
    team_id = models.IntegerField(primary_key=True)
    wins = models.IntegerField()
    losses = models.IntegerField()
    played_today = models.IntegerField()
    won_this_week = models.IntegerField()
    total_sp = models.IntegerField()
    mm_games_this_week = models.IntegerField()
    played_this_week = models.IntegerField()
    rotating_player_points = models.IntegerField()
    rotating_team_blocks = models.IntegerField()
    rotating_player_rebounds = models.IntegerField()
    rotating_team_assists = models.IntegerField()
    rotating_player_blocks = models.IntegerField()
    rotating_player_assists = models.IntegerField()
    rotating_team_steals = models.IntegerField()
    rotating_player_three_p = models.IntegerField()
    rotating_team_points = models.IntegerField()

    class Meta:
        managed = False
        db_table = "view_current_season_team_sp"


class CurrentSeasonTeamSPViewProxy(CurrentSeasonTeamSPView):
    class Meta:
        proxy = True

    objects = TeamStatsViewManager()
