#!/usr/bin/env python3

import sys
import requests
from uuid import uuid4

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
        'token': 'debug'
    }
    req = requests.post(f'{host}/user/create', json=user)
    print(req.status_code)
    print(req.text)
    url = f'{host}/user/{user.get("username")}'
    req = requests.post(url, json={'token': 'debug'})
    print(req.status_code)
    print(req.json())

# assert random user is not found
req = requests.post(f'{host}/user/{uuid4().hex}', json={'token': 'debug'})
assert req.status_code == 404

# get all users
req = requests.post(f'{host}/user', json={'token': 'debug'})
assert req.status_code == 200
print(req.json())
