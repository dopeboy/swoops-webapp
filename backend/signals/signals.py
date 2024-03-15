import django.dispatch

team_name_change_requested = django.dispatch.Signal()
team_name_change_accepted = django.dispatch.Signal()
team_logo_change_requested = django.dispatch.Signal()
team_logo_change_accepted = django.dispatch.Signal()


player_ownership_updated = django.dispatch.Signal()

new_account_created = django.dispatch.Signal()

game_simulation_status_updated = django.dispatch.Signal()
