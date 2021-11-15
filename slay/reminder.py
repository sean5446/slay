
import time
import _thread
from .sendmail import SendMail


_REMINDER_DELAY_MIN = 10 * 60


class Reminder:
    @staticmethod
    def run(delay=_REMINDER_DELAY_MIN):
        _thread.start_new_thread(Reminder.remind_players, ("reminder thread", delay,))

    @staticmethod
    def remind_players(thread_name, delay):
        while True:
            time.sleep(delay)

            # look for last_turn times in games, send emails

            print(f"{thread_name}: {time.ctime(time.time())}")
