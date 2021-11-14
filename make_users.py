#!/usr/bin/env python3

import sys
import os
import requests
from uuid import uuid4

token = os.environ.get('DEBUG_TOKEN')
if not token:
    print("DEBUG_TOKEN not set as env variable, we won't pass auth")
    sys.exit(1)

if len(sys.argv) > 1:
    host = sys.argv[1]
else:
    host = 'http://localhost:8080'

print(f'host: {host}')

# make 4 computers
for i in range(1, 5):
    user = {
        'username': f'Computer {i}', 
        'email': f'computer{i}@gmail.com', 
        'computer': 1, 
        'token': token,
    }
    req = requests.post(f'{host}/user/create', json=user)
    print(req.status_code)
    print(req.text)
    url = f'{host}/user/{user.get("username")}'
    req = requests.post(url, json={'token': token})
    print(req.status_code)
    print(req.json())

# assert random user is not found
req = requests.post(f'{host}/user/{uuid4().hex}', json={'token': token})
assert req.status_code == 404

# get all users
req = requests.post(f'{host}/user', json={'token': token})
assert req.status_code == 200
print(req.json())
