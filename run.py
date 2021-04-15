
import slay

if __name__ == "__main__":
    slay.app.run(host="0.0.0.0", port=80)
    # slay.app.run(host="0.0.0.0", port=443, ssl_context='adhoc')
    # https://blog.miguelgrinberg.com/post/running-your-flask-application-over-https
