import json
import os
import sys

try:
    from urllib.parse import urlparse, urlencode
    from urllib.request import urlopen, Request, build_opener, HTTPHandler
    from urllib.error import HTTPError
except ImportError:
    from urlparse import urlparse
    from urllib import urlencode
    from urllib2 import urlopen, Request, HTTPError, build_opener, HTTPHandler


EMAIL = os.environ['CLARIFAI_USER_EMAIL']
PASSWORD = os.environ['CLARIFAI_USER_PASSWORD']


BASE = 'https://api.clarifai.com/v2'


def _request(method, url, payload={}, headers={}):
    opener = build_opener(HTTPHandler)
    full_url = '%s%s' % (BASE, url)
    request = Request(full_url, data=json.dumps(payload).encode())
    for k in headers.keys():
        request.add_header(k, headers[k])
    request.get_method = lambda: method
    return json.loads(opener.open(request).read().decode())


def create_app(env_name):
    session_token, user_id = _login()

    url = '/users/%s/apps' % user_id
    payload = {'apps': [{'name': 'auto-created-in-%s-ci-test-run' % env_name}]}

    response = _request(method='POST', url=url, payload=payload, headers=_auth_headers(session_token))

    _raise_on_http_error(response)
    data = response
    app_id = data['apps'][0]['id']

    # This print needs to be present so we can read the value in CI.
    print(app_id)


def create_key(app_id):
    session_token, user_id = _login()

    url = '/users/%s/keys' % user_id
    payload = {
        'keys': [{
            'description': 'Auto-created in a CI test run',
            'scopes': ['All'],
            'apps': [{'id': app_id, 'user_id': user_id}]
        }]
    }
    response = _request(method='POST', url=url, payload=payload, headers=_auth_headers(session_token))
    _raise_on_http_error(response)
    data = response
    key_id = data['keys'][0]['id']

    # This print needs to be present so we can read the value in CI.
    print(key_id)


def delete(app_id):
    session_token, user_id = _login()

    # All the related keys will be deleted automatically when the app is deleted
    _delete_app(session_token, user_id, app_id)


def create_sample_workflow(api_key):
    url = '/workflows'
    payload = {
        'workflows': [
            {
                'id': 'food-and-general',
                'nodes': [
                    {
                        'id': 'food-workflow-node',
                        'model': {
                            'id': 'bd367be194cf45149e75f01d59f77ba7',
                            'model_version': {
                                'id': 'dfebc169854e429086aceb8368662641'
                            }
                        }
                    },
                    {
                        'id': 'general-workflow-node',
                        'model': {
                            'id': 'aaa03c23b3724a16a56b629203edc62c',
                            'model_version': {
                                'id': 'aa9ca48295b37401f8af92ad1af0d91d'
                            }
                        }
                    }
                ]
            }
        ]
    }
    response = _request(method='POST', url=url, payload=payload, headers=_auth_headers_for_api_key_key(api_key))
    _raise_on_http_error(response)


def _delete_app(session_token, user_id, app_id):
    url = '/users/%s/apps/%s' % (user_id, app_id)
    response = _request(method='DELETE', url=url, headers=_auth_headers(session_token))
    _raise_on_http_error(response)


def _auth_headers(session_token):
    headers = {'Content-Type': 'application/json', 'X-Clarifai-Session-Token': session_token}
    return headers


def _auth_headers_for_api_key_key(api_key):
    headers = {'Content-Type': 'application/json', 'Authorization': 'Key ' + api_key}
    return headers


def _login():
    url = '/login'
    payload = {'email': EMAIL, 'password': PASSWORD}
    response = _request(method='POST', url=url, payload=payload)
    _raise_on_http_error(response)
    data = response
    user_id = data['v2_user_id']
    session_token = data['session_token']
    return session_token, user_id


def _raise_on_http_error(response):
    # TODO: Make this work with urllib.
    # if int(response.status_code) // 100 != 2:
    #     raise Exception('Unexpected response %s: %s' % (response.status_code, response.text))
    pass


def run(arguments):
    command = arguments[0] if arguments else '--help'
    if command == '--create-app':
        if len(arguments) != 2:
            raise Exception('--create-app takes one argument')

        env_name = arguments[1]
        create_app(env_name)
    elif command == '--create-key':
        if len(arguments) != 2:
            raise Exception('--create-key takes one argument')

        app_id = arguments[1]
        create_key(app_id)
    elif command == '--delete-app':
        if len(arguments) != 2:
            raise Exception('--delete-app takes one argument')
        app_id = arguments[1]
        delete(app_id)
    elif command == '--create-workflow':
        if len(arguments) != 2:
            raise Exception('--create-workflow takes one argument')
        api_key = arguments[1]
        create_sample_workflow(api_key)
    elif command == '--help':
        print('''DESCRIPTION: Creates and delete applications and API keys
ARGUMENTS:
--create-app [env_name]      ... Creates a new application.
--create-key [app_id]        ... Creates a new API key.
--delete-app [app_id]        ... Deletes an application (API keys that use it are deleted as well).
--create-workflow [api_key]  ... Creates a sample workflow to be used in int. tests.
--help                       ... This text.''')
    else:
        print('Unknown argument. Please see --help')
        exit(1)


if __name__ == '__main__':
    run(arguments=sys.argv[1:])
