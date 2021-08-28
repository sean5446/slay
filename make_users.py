#!/bin/env python3

import sys
import requests

if len(sys.argv) > 1:
    host = sys.argv[1]
else:
    host = 'http://localhost'

print(f'host: {host}')

users = [
    {'username': 'Computer 1', 'email': 'computer1@gmail.com'},
    {'username': 'Computer 2', 'email': 'computer2@gmail.com'},
    {'username': 'Computer 3', 'email': 'computer3@gmail.com'},
    {'username': 'Computer 4', 'email': 'computer4@gmail.com'},
]

for user in users:
    req = requests.post(f'{host}/user/create', json=user)
    print(req.status_code)
    print(req.text)
    get_url = f'{host}/user/{user.get("username")}'
    req = requests.get(get_url, data=user)
    print(req.status_code)
    print(req.json())

req = requests.get(f'{host}/user/adfgsasdfs')
print(req.status_code)

req = requests.get(f'{host}/user')
print(req.status_code)
print(req.json())
