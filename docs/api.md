# streamers-edge v0.1.0

Backend module for StreamersEdge application

- [Auth](#auth)
	- [Logout](#logout)
	
- [Facebook](#facebook)
	- [Auth by facebook](#auth-by-facebook)
	
- [Google](#google)
	- [Auth by google](#auth-by-google)
	
- [Profile](#profile)
	- [Create peerplays account for authorized user](#create-peerplays-account-for-authorized-user)
	- [Get authorized user profile](#get-authorized-user-profile)
	- [Update authorized user profile](#update-authorized-user-profile)
	- [Get user by id](#get-user-by-id)
	
- [Twitch](#twitch)
	- [Auth by twitch](#auth-by-twitch)
	


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
# Facebook

## Auth by facebook



	GET /api/v1/auth/facebook


# Google

## Auth by google



	GET /api/v1/auth/google


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
    "username": "test",
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
    "username": "test",
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
    "username": "test",
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
    "username": "test",
    "youtube": "",
    "facebook": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": ""
  }
}
```
# Twitch

## Auth by twitch



	GET /api/v1/auth/twitch



