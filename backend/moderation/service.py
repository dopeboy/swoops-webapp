from django.core.exceptions import BadRequest

import moderation.models


class ModerationService:
    def _validate_no_pending_or_accepted_team_name_change_requests(self, team_id):
        if moderation.models.TeamNameChangeRequest.objects.filter(
            team_id=team_id,
            status__in=[
                moderation.models.Status.PENDING,
                moderation.models.Status.ACCEPTED,
            ],
        ).exists():

            raise BadRequest(
                "You cannot have more than one open name change request at a time, "
                + "and once a name is set, it can't be changed."
            )

    def _validate_team_name_isnt_pending_for_someone_else(self, proposed_name):
        if moderation.models.TeamNameChangeRequest.objects.filter(
            name__exact=proposed_name, status__exact=moderation.models.Status.PENDING
        ).exists():

            raise BadRequest("This name has already been reserved by another player.")

    def submit_team_name_change(self, team_id, new_name, requesting_user):

        self._validate_no_pending_or_accepted_team_name_change_requests(team_id)
        self._validate_team_name_isnt_pending_for_someone_else(new_name)

        moderation.models.TeamNameChangeRequest(
            team_id=team_id,
            name=new_name,
            requesting_user=requesting_user,
        ).save()

    def validate_no_open_or_accepted_team_logo_change_requests(self, team_id):
        if moderation.models.TeamLogoChangeRequest.objects.filter(
            team_id=team_id,
            status__in=[
                moderation.models.Status.PENDING,
                moderation.models.Status.ACCEPTED,
            ],
        ).exists():

            raise BadRequest(
                "You cannot have more than one open logo change request at a time, "
                + "and once a logo is set, it can't be changed."
            )

    def submit_team_logo_change(self, team_id, path, requesting_user):
        self.validate_no_open_or_accepted_team_logo_change_requests(team_id)

        moderation.models.TeamLogoChangeRequest(
            team_id=team_id,
            path=path,
            requesting_user=requesting_user,
        ).save()
