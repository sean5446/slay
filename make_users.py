#!/usr/bin/env python3

import sys
import requests
from uuid import uuid4

if len(sys.argv) > 1:
    host = sys.argv[1]
else:
    host = 'http://localhost:8080'

print(f'host: {host}')

users = [
    {'username': 'Computer 1', 'email': 'computer1@gmail.com', 'computer': 1},
    {'username': 'Computer 2', 'email': 'computer2@gmail.com', 'computer': 1},
    {'username': 'Computer 3', 'email': 'computer3@gmail.com', 'computer': 1},
    {'username': 'Computer 4', 'email': 'computer4@gmail.com', 'computer': 1},
]

for user in users:
    req = requests.post(f'{host}/user/create', json=user)
    print(req.status_code)
    print(req.text)
    get_url = f'{host}/user/{user.get("username")}'
    req = requests.get(get_url, data=user)
    print(req.status_code)
    print(req.json())

req = requests.get(f'{host}/user/{uuid4().hex}')
assert req.status_code == 404

req = requests.get(f'{host}/user')
assert req.status_code == 200
print(req.json())
