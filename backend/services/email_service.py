import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from settings import settings


def send_email(to_email: str, subject: str, body: str):
    try:
        message = MIMEMultipart()
        message["From"] = settings.MAIL_FROM
        message["To"] = to_email
        message["Subject"] = subject

        message.attach(MIMEText(body, "plain"))

        # Connect
        server = smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT)
        server.set_debuglevel(1)  
        server.ehlo()
        server.starttls()
        server.ehlo()

        # Login
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)

        # Send
        server.sendmail(
            settings.MAIL_FROM,
            to_email,
            message.as_string()
        )

        server.quit()
        print("✅ Email sent successfully")

    except Exception as e:
        print("❌ Email sending failed:", str(e))