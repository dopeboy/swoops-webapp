from django.urls import path

import eth.views

app_name = "eth"
urlpatterns = [
    path(
        "tokens/<str:wallet_address>/",
        eth.views.TokenPurchaseIntentView.as_view(),
        name="token-purchase-intent",
    ),
]
