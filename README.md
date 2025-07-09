# Slay

[openhex ](https://github.com/alcalyn/openhex) is a much more complete version of what I was going for

## Overview
- Can run on Heroku, see `./Procfile`
- Uses Firebase for login and authorization
- Uses sqlite database `./slay.db` or env var `DATABASE_URL` (heroku default) as URI


## Starting
1. Use a Python virual environment `python -m venv <venv-name>`, then activate venv

2. Install required packages `pip install -r requirements.txt`

3. Get Firebase credentials 

    - `./firebase_auth.json` or env var `FIREBASE_AUTH` (as JSON) is for web

    - `./firebase_admin.json` or env var `FIREBASE_ADMIN` (as JSON) is for backend

4. Run the app `python3 ./run.py`


## Code
- Main project is in Python
- Web code is in `./www/` folder
- Tests are in `./test`
- Helper script `./make_users.py` makes a few test users
- Reminder is a placeholder to send reminder emails when players haven't made a move


## Tests
From source root: `python3 -m unittest discover test`
Where `test` is the folder with the tests
