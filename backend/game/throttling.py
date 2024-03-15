from rest_framework import throttling


class AnonBurstRateThrottle(throttling.AnonRateThrottle):
    THROTTLE_RATES = {"anon_sec": "1/sec"}
    scope = "anon_sec"


class AnonSustainedRateThrottle(throttling.AnonRateThrottle):
    THROTTLE_RATES = {"anon_day": "3000/day"}
    scope = "anon_day"


class UserBurstRateThrottle(throttling.UserRateThrottle):
    THROTTLE_RATES = {"user_sec": "2/sec"}
    scope = "user_sec"


class UserSustainedRateThrottle(throttling.UserRateThrottle):
    THROTTLE_RATES = {"user_day": "3000/day"}
    scope = "user_day"
