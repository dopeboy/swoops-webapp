from django import forms
from django.core.exceptions import ValidationError

import game.models


class TournamentForm(forms.ModelForm):
    tokens_required = forms.IntegerField(initial=5, required=True)

    class Meta:
        model = game.models.Tournament
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super(TournamentForm, self).__init__(*args, **kwargs)

        if kwargs.get("instance"):
            tournament = kwargs.get("instance")
            self.fields["tokens_required"].initial = tournament.contest.tokens_required


class SeriesForm(forms.Form):
    entry_1 = forms.ModelChoiceField(label="Tournament Entry 1", queryset=None)
    entry_2 = forms.ModelChoiceField(label="Tournament Entry 2", queryset=None)
    round_id = forms.CharField(widget=forms.HiddenInput())

    def __init__(self, round, *args, **kwargs):
        super(SeriesForm, self).__init__(*args, **kwargs)
        self.fields["entry_1"].queryset = game.models.TournamentEntry.objects.filter(
            tournament=round.tournament
        )
        self.fields["entry_2"].queryset = game.models.TournamentEntry.objects.filter(
            tournament=round.tournament
        )

        self.fields["round_id"].initial = round.id

    def clean(self):
        cleaned_data = super().clean()
        entry_1 = cleaned_data.get("entry_1")
        entry_2 = cleaned_data.get("entry_2")

        if not entry_1.lineup:
            raise ValidationError("Tournament Entry 1 must have a lineup submitted.")

        if not entry_2.lineup:
            raise ValidationError("Tournament Entry 2 must have a lineup submitted.")

        return cleaned_data
