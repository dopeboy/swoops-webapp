from django.conf import settings
from python_http_client.exceptions import HTTPError
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail


def send(
    subject,
    message,
    url,
    to=[],
    bcc=[],
    template_id=settings.SENDGRID_GENERAL_TEMPLATE_ID,
):

    mail = Mail(from_email=settings.EMAIL_FROM, to_emails=to)

    # pass custom values for our HTML placeholders
    mail.dynamic_template_data = {
        "subject": subject,
        "body": message,
        "url": url,
    }

    # template ID, in sendgrid settings
    mail.template_id = template_id

    mail.bcc = bcc

    # create our sendgrid client object, pass it our key
    # then send and return our response objects
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)

        response = sg.send(mail)
        _, _, _ = response.status_code, response.body, response.headers
    except HTTPError as e:
        print(e.to_dict)
