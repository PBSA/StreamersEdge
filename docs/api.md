# streamers-edge v0.1.0

Backend module for StreamersEdge application

- [Auth](#auth)
	- [Logout](#logout)
	- [Auth with twitch code](#auth-with-twitch-code)
	- [Get redirect url](#get-redirect-url)
	
- [Profile](#profile)
	- [Create peerplays account for authorized user](#create-peerplays-account-for-authorized-user)
	- [Get authorized user profile](#get-authorized-user-profile)
	- [Update authorized user profile](#update-authorized-user-profile)
	- [Get user by id](#get-user-by-id)
	


# Auth

## Logout



	POST /api/v1/auth/logout


### Examples

Request-Example:

```
{}
```

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "status": 200,
  "result": true
}
```
## Auth with twitch code

<p>After getting a code from twitch (twitch returns user to the redirect url with code), you should send this code to backend for finishing authentication process</p>

	POST /api/v1/auth/code


### Examples

Request-Example:

```
{
  "code": "334442ikjds--s0dff"
}
```

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "status": 200,
  "result": {
    "id": "5cc315041ec568398b99d7ca",
    "twitchUsername": "test",
    "youtube": "",
    "facebook": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": ""
  }
}
```
## Get redirect url

<p>You should use this method for receiving urls for redirect.</p>

	GET /api/v1/auth/redirect-url


### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "result": "https://id.twitch.tv/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost&scope=user_read&state=true&client_id=5uyyouelk9a2d5rt0i1uuvntel2mb5",
  "status": 200
}
```
# Profile

## Create peerplays account for authorized user



	POST /api/v1/profile/peerplays/create-account


### Examples

Request-Example:

```
{
  "name": "testaccount",
  "activeKey": "PPY5iePa6MU4QHGyY5tk1XjngDG1j9jRWLspXxLKUqxSc4sh51ZS4",
  "ownerKey": "PPY5iePa6MU4QHGyY5tk1XjngDG1j9jRWLspXxLKUqxSc4sh51ZS4",
}
```

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "status": 200,
  "result": {
    "id": "5cc315041ec568398b99d7ca",
    "twitchUsername": "test",
    "youtube": "",
    "facebook": "",
    "peerplaysAccountName": "testaccount",
    "bitcoinAddress": ""
 }
}
```
## Get authorized user profile

<p>Get profile of authorized user</p>

	GET /api/v1/profile


### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "status": 200,
  "result": {
    "id": "5cc315041ec568398b99d7ca",
    "twitchUsername": "test",
    "youtube": "",
    "facebook": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": ""
  }
}
```
## Update authorized user profile



	PATCH /api/v1/profile


### Examples

Request-Example:

```
{
  "youtube": "",
  "facebook": "",
  "peerplaysAccountName": "",
  "bitcoinAddress": ""
}
```

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "status": 200,
  "result": {
    "id": "5cc315041ec568398b99d7ca",
    "twitchUsername": "test",
    "youtube": "",
    "facebook": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": ""
 }
}
```
## Get user by id



	GET /api/v1/user/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| id			| String			|  <p>User id</p>							|

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "status": 200,
  "result": {
    "id": "5cc315041ec568398b99d7ca",
    "twitchUsername": "test",
    "youtube": "",
    "facebook": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": ""
  }
}
```
