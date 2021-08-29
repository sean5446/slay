
import os
import time
import _thread
import smtplib
import ssl

# https://myaccount.google.com/lesssecureapps

_REMINDER_DELAY_MIN = 10 * 60


class Reminder:
    @staticmethod
    def run(delay=_REMINDER_DELAY_MIN):
        _thread.start_new_thread(Reminder.remind_players, ("reminder thread", delay,))

    @staticmethod
    def remind_players(thread_name, delay):
        count = 0
        while True:
            time.sleep(delay)
            count += 1
            print(f"{thread_name}: {time.ctime(time.time())}")


class SendMail:
    @staticmethod
    def send_mail(to_email, message):
        port = 465
        smtp_server = "smtp.gmail.com"
        sender_email = "robovencheck@gmail.com"
        receiver_email = to_email
        password = os.environ['GMAIL_PASSWORD']
        context = ssl.create_default_context()

        with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message)

    @staticmethod
    def send_your_turn_mail(to_email):
        link = ''
        msg = f"""
        Its your turn in {link}
        """
        SendMail.send_mail(to_email, msg)
