# streamers-edge v0.1.0

Backend module for StreamersEdge application

- [Auth](#auth)
	- [Logout](#logout)
	- [Auth with google code](#auth-with-google-code)
	- [Auth with twitch code](#auth-with-twitch-code)
	- [Get redirect url for auth with Google](#get-redirect-url-for-auth-with-google)
	- [Get redirect url for auth with Twitch](#get-redirect-url-for-auth-with-twitch)
	
- [Challenges](#challenges)
	- [Create new challenge](#create-new-challenge)
	
- [Profile](#profile)
	- [Create peerplays account for authorized user](#create-peerplays-account-for-authorized-user)
	- [Get authorized user profile](#get-authorized-user-profile)
	- [Update authorized user profile](#update-authorized-user-profile)
	
- [Users](#users)
	- [Get user by id](#get-user-by-id)
	- [Get users list](#get-users-list)
	


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
## Auth with google code

<p>After getting a code from google (google returns user to the redirect url with code), you should send this code to backend for finishing authentication process</p>

	POST /api/v1/auth/google/code


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
    "username": "test",
    "youtube": "",
    "facebook": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": ""
  }
}
```
## Auth with twitch code

<p>After getting a code from twitch (twitch returns user to the redirect url with code), you should send this code to backend for finishing authentication process</p>

	POST /api/v1/auth/twitch/code


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
    "username": "test",
    "youtube": "",
    "facebook": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": ""
  }
}
```
## Get redirect url for auth with Google

<p>You should use this method for receiving urls for redirect.</p>

	GET /api/v1/auth/google/redirect-url


### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "result": "https://accounts.google.com/o/oauth2/auth?approval_prompt=...",
  "status": 200
}
```
## Get redirect url for auth with Twitch

<p>You should use this method for receiving urls for redirect.</p>

	GET /api/v1/auth/twitch/redirect-url


### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "result": "https://id.twitch.tv/oauth2/authorize?...",
  "status": 200
}
```
# Challenges

## Create new challenge



	POST /api/v1/challenges


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| name			| String			|  <p>Name of challenge</p>							|
| startDate			| Date			| **optional** <p>Date of start challenge in ISO format</p>							|
| endDate			| Date			| **optional** <p>Date of end challenge in ISO format</p>							|
| game			| String			|  <p>Type of challenge game. Now can be 'pubg' only</p>							|
| accessRule			| String			|  <p>Type of access - anyone or invite</p>							|
| ppyAmount			| Number			|  <p>PPY Amount for challenge in &quot;satoshis&quot;</p>							|
| param.shouldLead			| Boolean			| **optional** <p>Criteria. User should win to pass the challenge</p>							|
| param.shouldKill			| Number			| **optional** <p>Criteria. User should kill specifies count of frags to pass the challenge</p>							|
| param.shouldWinPerTime			| Number			| **optional** <p>Criteria. User should win per specified count of minutes</p>							|
| param.minPlace			| Number			| **optional** <p>Criteria. Should end game on the specified place or higher</p>							|

### Examples

Request-Example:

```
{
  "name": "Test name",
  "startDate": "2019-04-04T08:32:19.818Z",
  "endDate": "2019-04-04T08:32:19.818Z",
  "game": "pubg",
  "accessRule": "anyone",
  "ppyAmount": 100,
  "invitedAccounts": [],
  "params": {
    "shouldLead": true,
    "shouldKill": 1,
    "shouldWinPerTime": 3,
    "minPlace": 3
  }
}
```

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
 "result": {
   "id": 2,
   "name": "Test name",
   "createdAt": "2019-04-04T08:32:19.818Z",
   "startDate": null,
   "endDate": null,
   "game": "pubg",
   "accessRule": "anyone",
   "ppyAmount": "1",
   "user": {
     "id": 1,
     "username": "User Name",
     "youtube": "",
     "facebook": "",
     "peerplaysAccountName": "",
     "bitcoinAddress": ""
   },
   "criteria": {
     "id": 2,
     "shouldLead": true,
     "shouldKill": null,
     "shouldWinPerTime": null,
     "minPlace": null,
     "createdAt": "2019-04-04T08:32:19.831Z",
     "updatedAt": "2019-04-04T08:32:19.831Z",
     "challengeId": 2
   },
   "invitedUsers": []
 },
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
# Users

## Get user by id



	GET /api/v1/users/:id


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
## Get users list



	GET /api/v1/users


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| search			| String			| **optional** <p>Filter by PeerPlays Account Name</p>							|
| limit			| Number			|  <p>Limit of rows</p>							|
| skip			| Number			| **optional** <p>Number of rows to skip</p>							|

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "status": 200,
  "result": [{
    "id": "5cc315041ec568398b99d7ca",
    "username": "test",
    "youtube": "",
    "facebook": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": ""
  }]
}
```

