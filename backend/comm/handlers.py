from django.conf import settings

import comm.email
import comm.notification
import game.models


def verification_email_handler(user):
    url = f"https://{ settings.API_EXTERNAL_HOSTNAME }/accounts/verify-email?token={user.email_verification_token}"  # noqa: E501

    message = f'<a href="{url}">Click</a> to verify your email'
    subject = "Verify your email"

    comm.email.send(
        subject,
        message,
        url,
        to=[user.email],
        template_id=settings.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID,
    )

    return True


def game_complete_handler(completed_game):
    # Insert notifications into each user's magic bell queue
    url = (
        f"{ settings.SWOOPS_APP_BASEURL }headtohead/{ completed_game.id }"
        "/joined/boxscore"
    )
    message = "Click here to watch it."

    # To user behind lineup 1
    mm_contest_type = game.models.Contest.Kind.HEAD_TO_HEAD_MATCH_MAKE
    game_type = "matchmade" if completed_game.contest.kind == mm_contest_type else ""

    subject = (
        f"Your {game_type} game vs the "
        f"{ completed_game.lineup_2.team.name } has completed!"
    )

    comm.notification.send(
        title=subject,
        body=message,
        click_url=url,
        user_id=str(completed_game.lineup_1.team.owner.id),
    )

    # To user behind lineup 2
    subject = (
        f"Your {game_type} game vs the "
        f"{ completed_game.lineup_1.team.name } has completed!"
    )

    comm.notification.send(
        title=subject,
        body=message,
        click_url=url,
        user_id=str(completed_game.lineup_2.team.owner.id),
    )
    """
    NOTE - EMAILS ARE DISABLED
    url = f"{ settings.SWOOPS_APP_BASEURL }headtohead/{ game.id }/joined/boxscore"  # noqa: E501
    subject = f"{game.lineup_1.team.name } vs { game.lineup_2.team.name }  ... and the winner is"  # noqa: E501
    message = "Your latest Swoops game has ended, check out the result and game stats."
    comm.email.send(
        subject,
        message,
        url,
        to=["no-reply@playswoops.com"],
        bcc=[
            game.lineup_1.team.owner.email,
            game.lineup_2.team.owner.email,
        ],
        template_id=settings.SENDGRID_GAME_RESULTS_TEMPLATE_ID,
    )
    """


def team_name_approved_handler(user):
    url = f"{ settings.SWOOPS_APP_BASEURL }players/roster"
    subject = "Name approved!"
    message = f"""
    Hey Swoopster,<br/><br/>
    Just writing to let you know your new team name has been approved!<br/><br/>
    Your fans can't wait to get their hands on your merch.<br/><br/>
    Take a look at your locker room <a href=\"{url}\">here</a> to see the
    changes.<br/><br/>
    -Team Swoops<br/><br/>
    PS: Running into problems? Reach out to us over DM at @playswoops on Twitter.
    """

    comm.email.send(subject, message, url, to=[user.email])

    return True


def team_name_rejected_handler(user, rejection_reason):
    url = f"{ settings.SWOOPS_APP_BASEURL }players/roster"
    subject = "Regarding your team name"
    message = f"""
    Hey Swoopster,<br/><br/>
    Our moderation team took a look at the team name you submitted and we weren't able to approve it.
    The feedback we have for you about it is: { rejection_reason }<br/><br/>
    Don't let this stop you! Pick another name that your fans will love and your opponents will fear.<br/><br/>
    Head back to your your locker room <a href=\"{url}\">here</a> and take another shot.<br/><br/>
    -Team Swoops<br/><br/>
    PS: Running into problems? Reach out to us over DM at @playswoops on Twitter.
    """  # noqa: E501

    comm.email.send(subject, message, url, to=[user.email])

    return True


def team_logo_approved_handler(user):
    url = f"{ settings.SWOOPS_APP_BASEURL }players/roster"
    subject = "Logo approved!"
    message = f"""
    Hey Swoopster,<br/><br/>
    Just writing to let you know your new team logo has been approved!<br/><br/>
    Your fans can't wait to get their hands on your merch.<br/><br/>
    Take a look at your locker room <a href=\"{url}\">here</a> to see the
    changes.<br/><br/>
    -Team Swoops<br/><br/>
    PS: Running into problems? Reach out to us over DM at @playswoops on Twitter.
    """

    comm.email.send(subject, message, url, to=[user.email])

    return True


def team_logo_rejected_handler(user, rejection_reason):
    url = f"{ settings.SWOOPS_APP_BASEURL }players/roster"
    subject = "Regarding your team logo"
    message = f"""
    Hey Swoopster,<br/><br/>
    Our moderation team took a look at the team logo you submitted and we weren't able to approve it.<br/><br/>
    The feedback we have for you about it is: {rejection_reason}<br/><br/>
    Don't let this stop you! Pick another logo that your fans will love and your opponents will fear.<br/><br/>
    Take a look at your locker room <a href=\"{url}\">here</a> to see the changes.<br/><br/>
    -Team Swoops<br/><br/>
    PS: Running into problems? Reach out to us over DM at @playswoops on Twitter.
    """  # noqa: E501

    comm.email.send(subject, message, url, to=[user.email])

    return True


def player_name_approved_handler(user, token, name):
    url = f"{ settings.SWOOPS_APP_BASEURL }player-detail/{ token }/games"
    subject = "Your player name approved!!!"
    message = f"""
    Hey Swoopster,<br/><br/>
    Boomshakalaka! Your player { name } was approved.<br/><br/>
    Take a look at your shiny new player name <a href=\"{url}\">here</a>.<br/><br/>
    -Team Swoops<br/><br/>
    PS: Running into problems? Reach out to us over DM at @playswoops on Twitter.
    """

    comm.email.send(subject, message, url, to=[user.email])

    return True


def player_name_rejected_handler(user, rejection_reason):
    url = f"{ settings.SWOOPS_APP_BASEURL }players/roster"
    subject = "Swoops player name... Rejected, Whut!?!"
    message = f"""
    Hey Swoopster,<br/><br/>
    Rejected?!?! Well, the good thing is that you can try again.
    Here is the reason:<br/><br/>
    { rejection_reason }
    Login to the locker room <a href=\"{url}\">here</a> and submit another name.
    -Team Swoops<br/><br/>
    PS: Running into problems? Reach out to us over DM at @playswoops on Twitter.
    """

    comm.email.send(subject, message, url, to=[user.email])

    return True


def user_signup_handler(user):
    url = f"{ settings.SWOOPS_APP_BASEURL }/tutorial-v2"
    subject = "Welcome to Swoops!"
    message = """Hello!<br/><br/>
    Welcome to Swoops, the ONLY virtual basketball game and league in
    the WORLD with true team and player ownership. You are THIS close
    to owning, operating, and profiting from your own basketball
    franchise. To get your squad going, we’re going to start you off
    with a free agent that will turn into a fully owned player after you
    complete a few in-game tasks.<br/><br/>
    Here’s what happens next:<br/><br/>
    1. Click the button below to claim your free agent.<br/>
    2. Complete the new owner gameplay tutorial.<br/>
    3. Hit the court and earn 1,000 Swooper Points. <br/>
    4. Your rented player becomes your first FULLY OWNED player.
    """

    comm.email.send(
        subject,
        message,
        url,
        to=[user.email],
        template_id=settings.SENDGRID_WELCOME_EMAIL_TEMPLATE_ID,
    )
    return True


def gm_game_results(user, url, message):
    subject = "Your SwoopsGM challenge results"

    """
    comm.email.send(
        subject,
        message,
        url,
        to=[user.email],
    )
    """

    comm.notification.send(
        title=subject,
        body=message,
        click_url=url,
        user_id=str(user.id),
    )
