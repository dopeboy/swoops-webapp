def custom_jwt_payload_handler(user):
    return {
        "user_id": user.id,
        "wallet_address": user.wallet_address,
        "email": user.email,
        "is_superuser": user.is_superuser,
    }
