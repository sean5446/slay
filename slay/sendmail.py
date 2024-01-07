import smtplib
import ssl
import os

# https://myaccount.google.com/lesssecureapps

_DOMAIN = os.environ.get('DOMAIN', "https://slay-game.herokuapp.com")


class SendMail:
    @staticmethod
    def send_mail(to_email, message):
        sender_email = os.environ.get('EMAIL_USERNAME', None)
        password = os.environ.get('EMAIL_PASSWORD', None)
        if not sender_email or not password:
            print('email not configured')
            return
        port = 465
        smtp_server = "smtp.gmail.com"
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, to_email, message)

    @staticmethod
    def send_new_game(to_email, game_id):
        link = f'{_DOMAIN}/game/{game_id}'
        msg = f"""
        Subject: Slay - new game
        
        You've been invited to play a game of Slay! {link}
        """
        if 'computer' not in to_email:
            try:
                print(f'sending new game ({game_id}) email to {to_email}')
                SendMail.send_mail(to_email, msg)
            except Exception as ex:
                print(ex)

    @staticmethod
    def send_your_turn(to_email, game_id):
        link = f"{_DOMAIN}/game/{game_id}"
        msg = f"""
        Subject: Slay - it's your turn

        Its your turn in {link}
        """
        SendMail.send_mail(to_email, msg)
