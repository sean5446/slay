# Slay


## Overview
- Can run on Heroku, see `./Procfile`
- Uses firebase for login and authorization
- Uses sqlite data base `./slay.db` or env var `DATABASE_URI` (as URI)


## Starting
1. Create a Python virual environment

2. `pip install -r requirements.txt`

3. Get Firebase credentials 

    - `./firebase_auth.json` or env var `FIREBASE_AUTH` (as JSON) is for web

    - `./firebase_admin.json` or env var `FIREBASE_ADMIN` (as JSON) is for backend

4. `python3 ./run.py`


## Code
- Main project is in Python
- Web code is in `./www/` folder
- Tests are in `./test`
- Helper script `./make_users.py` makes a few test users
- Reminder is a placeholder to send reminder emails when players haven't made a move
