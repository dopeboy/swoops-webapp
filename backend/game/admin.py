import datetime
import json

from django import urls
from django.conf import settings
from django.contrib import admin, messages
from django.db.models import F, Q
from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.urls import path
from django.utils import timezone
from django.utils.html import mark_safe

import game.forms
import game.models
import game.tasks
import game.utils
import simulator.client
import simulator.models
import simulator.utils
from utils.db import load_data_from_sql

MAX_PLAYERS_PER_TEAM = 5


class TournamentEntryAdmin(admin.ModelAdmin):
    list_display = (
        "__str__",
        "tournament",
        "rank",
        "seed",
        "lineup_submitted",
        "created_at",
    )
    list_filter = ("created_at",)
    search_fields = ("team__name",)
    raw_id_fields = ("lineup",)
    autocomplete_fields = ("team", "tournament")

    def lineup_submitted(self, entry):
        return entry.lineup is not None

    lineup_submitted.boolean = True


class TournamentEntryInline(admin.TabularInline):
    model = game.models.TournamentEntry
    extra = 0
    fields = ("team", "has_submitted_lineup", "rank", "seed", "created_at")
    readonly_fields = ("team", "has_submitted_lineup", "created_at")
    max_num = 0
    can_delete = False
    classes = ["collapse"]

    def has_submitted_lineup(self, obj):
        if obj.lineup:
            return mark_safe(
                f'<a href="{urls.reverse("admin:game_lineup_change", args=(obj.lineup.id,))}" target="_blank"><img src="/static/admin/img/icon-yes.svg" alt="True"></a>'  # noqa: E501
            )
        return "-"


class RoundEntryInliline(admin.TabularInline):
    model = game.models.Round
    fields = ("round",)
    readonly_fields = ("round",)
    max_num = 0
    extra = 0
    can_delete = False
    show_change_link = True
    classes = ["collapse"]

    def round(self, obj):
        return obj.stage + 1


@admin.action(description="Copy Tournaments")
def copy_tournament(modeladmin, request, queryset):
    for tournament in queryset:
        # create contest object
        contest = game.models.Contest()
        contest.kind = game.models.Contest.Kind.TOURNAMENT
        contest.tokens_required = tournament.contest.tokens_required
        contest.save()

        copy_tournament = game.models.Tournament()

        copy_tournament.start_date = timezone.now()
        copy_tournament.end_date = copy_tournament.start_date + datetime.timedelta(
            minutes=120
        )

        count = game.models.Tournament.objects.filter(
            name__icontains=f"{tournament.name} - copy"
        ).count()

        copy_tournament.name = f"{tournament.name} - copy {count + 1}"

        copy_tournament.kind = tournament.kind
        copy_tournament.contest = contest
        copy_tournament.size = tournament.size
        copy_tournament.payout = tournament.payout
        copy_tournament.meta = tournament.meta
        copy_tournament.save()

        game.utils.build_tournament_structure(copy_tournament)


class TournamentAdmin(admin.ModelAdmin):
    form = game.forms.TournamentForm

    list_display = (
        "name",
        "size",
        "kind",
        "status",
        "rounded_payout",
        "lineup_submission_cutoff",
        "start_date",
        "end_date",
        "visibility_at",
        "finalized_on",
    )
    can_delete = False
    change_form_template = "admin/tournament_change_form.html"
    list_filter = (
        "visibility_at",
        "finalized_on",
        "kind",
        "size",
        "start_date",
        "end_date",
        "lineup_submission_cutoff",
    )
    exclude_fields = ("contest", "finalized_on")
    search_fields = ("name",)
    ordering = ("-created_at",)
    inlines = [TournamentEntryInline]
    actions = [copy_tournament]

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            path(
                r"tournament/<int:tournament_id>/round/<int:round_id>/series/<series_id>/",  # noqa: E501
                self.admin_site.admin_view(self.change_series),
                name="change-round-series",
            ),
            path(
                r"tournament/<int:tournament_id>/round/<int:round_id>/series/<int:series_id>/staff-publish/",  # noqa: E501
                self.admin_site.admin_view(self.staff_publish_series),
                name="staff-publish-series",
            ),
            path(
                r"tournament/<int:tournament_id>/round/<int:round_id>/series/<int:series_id>/public-publish/",  # noqa: E501
                self.admin_site.admin_view(self.public_publish_series),
                name="public-publish-series",
            ),
            path(
                r"tournament/<int:tournament_id>/round/<int:round_id>/series/",
                self.admin_site.admin_view(self.change_series),
                name="add-round-series",
            ),
        ]
        return my_urls + urls

    def rounded_payout(self, obj):
        if obj.payout:
            return round(obj.payout, 2)
        return None

    def get_form(self, request, instance=None, **kwargs):
        help_texts = {
            "populate_entry_lineups": "Populates the tournament entry lineup.",
            "kind": "Period tournament is executed",
            "reveal": "Public reveal of this tournament and all it's entries.",
            "name": "Name of the tournament",
            "tokens_required": (
                "Maximum number of owned players a user can submit within a lineup"
            ),
            "size": "Size of the tournament bracket. Must be 4, 8, 16, 32, 64.",
            "payout": "Cumulative rewards winners will recieve after the tournament is complete. Note: The Time is reference in UTC.",  # noqa: E501
            "lineup_submission_cutoff": "The final date a user can submit a lineup by. Note: The Time is reference in UTC.",  # noqa: E501
            "start_date": "The start date of the tournament. Note: The Time is reference in UTC.",  # noqa: E501
            "end_date": "The end date of the tournament. Note: The Time is reference in UTC.",  # noqa: E501
            "meta": 'The meta field is used for custom configuration of the max games played and a breakdown of the payouts winners. For example: {"max_games_per_round": [3,5],"payout_breakdown_usd": [4,2]}. This meta data entry "max_games_per_round" has round 1 play the best of max 3 games and round 2 play best of max 5 games. The "payout_breakdown_usd" breaks down the payout field with the first value of 4 being awarded to the 1st place winner and 2 being awarded to the 2nd place, the sume of both entries must equal the total payouts field.',  # noqa: E501
        }
        kwargs.update({"help_texts": help_texts})
        self.exclude = (
            "contest",
            "finalized_on",
            "number_of_payouts",
        )

        form = super(TournamentAdmin, self).get_form(request, instance, **kwargs)
        form.base_fields["meta"].initial = json.dumps(
            {
                "max_games_per_round": [],
                "payout_breakdown_usd": [],
            }
        )
        return form

    def save_model(self, request, tournament, form, change):
        if not change:
            contest = game.models.Contest()
            contest.kind = game.models.Contest.Kind.TOURNAMENT
            contest.tokens_required = form.cleaned_data.get("tokens_required")
            contest.save()
            tournament.contest = contest
            tournament.save()

            game.utils.build_tournament_structure(tournament)

        else:
            tournament.contest.tokens_required = form.cleaned_data.get(
                "tokens_required"
            )
            tournament.contest.save()

        if tournament.populate_entry_lineups:
            for tournament_entry in game.models.TournamentEntry.objects.filter(
                tournament=tournament, lineup=None
            ):
                # search for players owned by team ordered random
                players = []
                for player in game.models.Player.objects.filter(
                    team=tournament_entry.team
                ).order_by("?")[:MAX_PLAYERS_PER_TEAM]:
                    players.append(player)

                # additional players needed search for additional players
                if len(players) < MAX_PLAYERS_PER_TEAM:
                    free_agents_needed = MAX_PLAYERS_PER_TEAM - len(players)
                    for player in game.models.Player.objects.filter(
                        simulated__token__lt=0
                    ).order_by("?")[:free_agents_needed]:
                        players.append(player)

                # build lineup
                if len(players) >= MAX_PLAYERS_PER_TEAM:
                    lineup = game.models.Lineup()
                    lineup.team = tournament_entry.team
                    lineup.player_1 = players[0]
                    lineup.player_2 = players[1]
                    lineup.player_3 = players[2]
                    lineup.player_4 = players[3]
                    lineup.player_5 = players[4]
                    lineup.save()

                    tournament_entry.lineup = lineup
                    tournament_entry.save()

        super().save_model(request, tournament, form, change)

    def changeform_view(self, request, obj_id, form_url, extra_context=None):
        try:
            tournament = self.model.objects.get(id=obj_id)
            rounds = []

            for round in game.models.Round.objects.select_related("tournament").filter(
                tournament=tournament
            ):
                matches = []

                for series in (
                    game.models.Series.objects.prefetch_related("games")
                    .select_related(
                        "entry_1",
                        "entry_1__team",
                        "entry_1__lineup",
                        "entry_2",
                        "entry_2__team",
                        "entry_2__lineup",
                    )
                    .filter(round=round)
                ):
                    games = []
                    for instance in (
                        series.games.select_related(
                            "simulation",
                            "simulation__result",
                        )
                        .all()
                        .exclude(simulation=None)
                    ):
                        games.append(
                            {
                                "team_1_score": instance.simulation.result.lineup_1_score  # noqa: E501
                                if instance.simulation.status
                                == simulator.models.Simulation.Status.FINISHED
                                else "-",
                                "team_2_score": instance.simulation.result.lineup_2_score  # noqa: E501
                                if instance.simulation.status
                                == simulator.models.Simulation.Status.FINISHED
                                else "-",
                                "visibility": instance.visibility,
                            }
                        )

                    finished_games_count = series.games.filter(
                        simulation__status=simulator.models.Simulation.Status.FINISHED  # noqa: E501
                    ).count()
                    entry_1_wins = series.games.filter(
                        simulation__result__lineup_1_score__gt=F(
                            "simulation__result__lineup_2_score"
                        )
                    ).count()

                    entry_2_wins = finished_games_count - entry_1_wins

                    matches.append(
                        {
                            "series": series,
                            "games": games,
                            "entry_1_wins": entry_1_wins,
                            "entry_2_wins": entry_2_wins,
                        }
                    )

                is_simulation_ready_to_run = (
                    game.models.Series.objects.filter(
                        Q(entry_1=None) & Q(entry_2=None), round=round
                    ).count()
                    == 0
                )

                rounds.append(
                    {
                        "round": round,
                        "series": matches,
                        "is_simulation_ready_to_run": is_simulation_ready_to_run,
                    }
                )

            all_lineups_submitted = (
                game.models.TournamentEntry.objects.filter(tournament=tournament)
                .exclude(lineup=None)
                .count()
                == tournament.size
            )

            all_entries_exist = (
                game.models.TournamentEntry.objects.filter(
                    tournament=tournament
                ).count()
                == tournament.size
            )

            all_entries_has_seeds_assigned = (
                tournament.size
                == game.models.TournamentEntry.objects.filter(
                    seed__gt=0, tournament=tournament
                ).count()
            )

            extra_context = {
                "id": obj_id,
                "tournament": tournament,
                "rounds": rounds,
                "all_lineups_submitted": all_lineups_submitted,
                "all_entries_exist": all_entries_exist,
                "all_entries_has_seeds_assigned": all_entries_has_seeds_assigned,
                "app_base_url": settings.SWOOPS_APP_BASEURL,
            }

        except game.models.Tournament.DoesNotExist:
            extra_context = {
                "id": obj_id,
                "size": None,
                "rounds": [],
                "app_base_url": settings.SWOOPS_APP_BASEURL,
            }

        extra_context["show_save_and_add_another"] = False
        return super(TournamentAdmin, self).changeform_view(
            request, obj_id, form_url, extra_context=extra_context
        )

    def change_series(self, request, tournament_id, round_id, series_id=None):
        round = game.models.Round.objects.get(id=round_id)
        series = None
        if request.method == "POST":
            form = game.forms.SeriesForm(round, request.POST)
            if form.is_valid():
                if series_id:
                    series = game.models.Series.objects.get(id=series_id)
                else:
                    series = game.models.Series()

                series.round = round
                series.entry_1 = form.cleaned_data.get("entry_1")
                series.entry_2 = form.cleaned_data.get("entry_2")
                series.save()
                if series_id:
                    self.message_user(
                        request,
                        f"Tournament Team Match updated. {series.entry_1.team.name} vs {series.entry_2.team.name}.",  # noqa: E501
                    )
                else:
                    self.message_user(
                        request,
                        f"Tournament Team Match created. {series.entry_1.team.name} vs {series.entry_2.team.name}",  # noqa: E501
                    )
            else:
                for error in form.errors["__all__"]:
                    self.message_user(
                        request,
                        error,  # noqa: E501
                        level=messages.ERROR,  # noqa: E501
                    )
            return redirect(
                urls.reverse("admin:game_tournament_change", args=(tournament_id,))
            )

        elif series_id:
            series = game.models.Series.objects.get(id=series_id)
            adminform = game.forms.SeriesForm(
                round,
                initial={"entry_1": series.entry_1, "entry_2": series.entry_2},
            )
        else:
            adminform = game.forms.SeriesForm(round.tournament)

        context = dict(
            self.admin_site.each_context(request),
            round=round,
            adminform=adminform,
            series=series,
            tournament_id=tournament_id,
        )
        return TemplateResponse(
            request, "admin/series_change_form_template.html", context
        )

    def staff_publish_series(self, request, tournament_id, round_id, series_id):
        series = game.models.Series.objects.get(id=series_id)
        series.games.update(visibility=game.models.Game.Visibility.STAFF)
        return redirect(
            urls.reverse("admin:game_tournament_change", args=(tournament_id,))
        )

    def public_publish_series(self, request, tournament_id, round_id, series_id):
        series = game.models.Series.objects.get(id=series_id)
        if series.games.count() and series.status == game.models.Series.Status.FINISHED:
            game.utils.public_publish_series(series)

        tournament = game.models.Tournament.objects.get(id=tournament_id)
        game.utils.finalize_tournament(tournament)

        return redirect(
            urls.reverse("admin:game_tournament_change", args=(tournament_id,))
        )

    def response_change(self, request, tournament):
        if "run-simulation" in request.POST:
            current_round = game.utils.run_tournament_simulations(tournament)

            if current_round:
                self.message_user(
                    request,
                    f"Tournament Games in Round { current_round.stage + 1} Started",
                )
            else:
                self.message_user(
                    request,
                    "Error finding tournament round",
                )

            return redirect(
                urls.reverse("admin:game_tournament_change", args=(tournament.id,))
            )
        elif "create-entries" in request.POST:
            # create new tournament entries

            # auto assign seeds for en of season tournaments
            if tournament.kind == game.models.Tournament.Kind.END_OF_SEASON:
                seed = 1
            else:
                seed = 0

            team_leaderboard = load_data_from_sql("game/sql/leaderboard_team_query.sql")
            team_ids = [team["team_id"] for team in team_leaderboard[: tournament.size]]
            for index, team in enumerate(
                game.models.Team.objects.filter(id__in=team_ids).order_by(
                    "-wins", "losses"
                )
            ):
                # exit loop if the number of tournament entries
                # match the tournament entry size
                if (
                    game.models.TournamentEntry.objects.filter(
                        tournament=tournament
                    ).count()
                    == tournament.size
                ):
                    break

                # skip if team already exist as an entry within tournament
                if game.models.TournamentEntry.objects.filter(
                    tournament=tournament, team=team
                ).exists():
                    continue

                tournament_entry = game.models.TournamentEntry()
                tournament_entry.tournament = tournament
                tournament_entry.team = team

                # auto assign seeds for end of season tournaments
                if tournament.kind == game.models.Tournament.Kind.END_OF_SEASON:
                    tournament_entry.rank = index + 1
                    tournament_entry.seed = seed

                tournament_entry.save()

                # auto assign seeds for end of season tournaments
                if tournament.kind == game.models.Tournament.Kind.END_OF_SEASON:
                    if (
                        not (index + 1) % 4
                    ) or (  # regular seeding for all other tournament sizes
                        not (index + 1) % 2
                        and tournament.size
                        == 4  # special seeding condition for tournament size of 4
                    ):
                        seed += 1

            return redirect(
                urls.reverse("admin:game_tournament_change", args=(tournament.id,))
            )
        elif "match-series-entries" in request.POST:
            current_round = game.models.Round.objects.get(
                **{"status": game.models.Round.Status.STARTED, "tournament": tournament}
            )

            if current_round.stage == 0:
                game.utils.matchup_tournament_entries(tournament)

            return redirect(
                urls.reverse("admin:game_tournament_change", args=(tournament.id,))
            )

        elif "assign-seeds" in request.POST:
            game.utils.random_assign_tournament_seeding(tournament=tournament)

            return redirect(
                urls.reverse("admin:game_tournament_change", args=(tournament.id,))
            )

        return super(TournamentAdmin, self).response_change(request, tournament)


class PlayerAdmin(admin.ModelAdmin):
    list_select_related = True
    list_display = ["id", "team", "simulated", "wins", "losses"]
    search_fields = ["simulated__full_name", "simulated__token"]

    def get_search_results(self, request, queryset, search_term):
        queryset, use_distinct = super().get_search_results(
            request, queryset, search_term
        )

        if request.path == "/secret-room/autocomplete/":
            if request.GET["app_label"] == "moderation":
                queryset = queryset.filter(
                    simulated__kind=simulator.models.Player.Kind.OFF_CHAIN,
                )

        return queryset, use_distinct


class ContestAdmin(admin.ModelAdmin):
    pass


class LineupAdmin(admin.ModelAdmin):
    list_select_related = True
    raw_id_fields = ("player_1", "player_2", "player_3", "player_4", "player_5")
    autocomplete_fields = ("team",)


@admin.action(description=f"Create {settings.OPEN_GAMES_LIMIT} Games")
def create_games(modeladmin, request, queryset):
    game.tasks.top_up_open_games_to_limit()


class GameAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "contest_status",
        "simulation_status",
        "prize_pool",
        "transaction_id",
    ]

    actions = [create_games]

    exclude = ("simulation",)

    def contest_status(self, obj):
        return f"{obj.contest.status}"

    def simulation_status(self, obj):
        return f"{obj.simulation.status}" if obj.simulation else "-"


class TeamAdmin(admin.ModelAdmin):
    list_select_related = True
    list_display = [
        "team",
        "name",
    ]
    search_fields = ("name",)
    readonly_fields = (
        "logo_img_tag_original",
        "logo_img_tag_200",
        "logo_img_tag_400",
    )

    def team(self, obj):
        return (
            f"Team owner wallet: {obj.owner.wallet_address},"
            f"Team owner email: {obj.owner.email}"
        )

    def logo_img_tag_original(self, obj):
        if obj.path:
            path = obj.path
            url = f"https://{settings.AWS_UGC_BUCKET_NAME}.s3.amazonaws.com/{path}"
            return mark_safe('<img src="%s" />' % (url))
        else:
            return "N/A"

    logo_img_tag_original.short_description = "Logo (original)"

    def logo_img_tag_200(self, obj):
        if obj.path:
            path = obj.path.split(".png")[0] + "_200x200.png"
            url = f"https://{settings.AWS_UGC_BUCKET_NAME}.s3.amazonaws.com/{path}"
            return mark_safe('<img src="%s" />' % (url))
        else:
            return "N/A"

    logo_img_tag_200.short_description = "Logo (200x200)"

    def logo_img_tag_400(self, obj):
        if obj.path:
            path = obj.path.split(".png")[0] + "_400x400.png"
            url = f"https://{settings.AWS_UGC_BUCKET_NAME}.s3.amazonaws.com/{path}"
            return mark_safe('<img src="%s" />' % (url))
        else:
            return "N/A"

    logo_img_tag_400.short_description = "Logo (400x400)"


admin.site.register(game.models.Tournament, TournamentAdmin)
admin.site.register(game.models.TournamentEntry, TournamentEntryAdmin)
admin.site.register(game.models.Player, PlayerAdmin)
admin.site.register(game.models.Game, GameAdmin)
admin.site.register(game.models.Team, TeamAdmin)
admin.site.register(game.models.Lineup, LineupAdmin)
