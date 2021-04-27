from setuptools import setup, find_packages

setup(
    name='slay',
    version='1.0.0',
    url='https://github.com/sean5446/',
    author='Author',
    author_email='author@gmail.com',
    description='Description of my package',
    packages=find_packages(),
    install_requires=[
        'Flask',
        'Flask-Limiter',
        'flask_SQLAlchemy',
        'flask_marshmallow',
        'marshmallow-sqlalchemy',
        'requests',
        'gunicorn',
        'psycopg2-binary',
        'firebase-admin',
    ],
)
