# streamers-edge v0.1.0

Backend module for StreamersEdge application

- [Auth](#auth)
	- [Confirm email](#confirm-email)
	- [Logout](#logout)
	- [Sign in](#sign-in)
	- [Sign up](#sign-up)
	- [Forgot password](#forgot-password)
	- [Reset password](#reset-password)
	
- [Challenges](#challenges)
	- [Create new challenge](#create-new-challenge)
	- [Get challenge by id](#get-challenge-by-id)
	
- [Facebook](#facebook)
	- [Auth by facebook](#auth-by-facebook)
	
- [Google](#google)
	- [Auth by google](#auth-by-google)
	
- [Profile](#profile)
	- [Create peerplays account for authorized user](#create-peerplays-account-for-authorized-user)
	- [Get authorized user profile](#get-authorized-user-profile)
	- [Update authorized user profile](#update-authorized-user-profile)
	
- [Twitch](#twitch)
	- [Auth by twitch](#auth-by-twitch)
	
- [Users](#users)
	- [Get user by id](#get-user-by-id)
	- [Get users list](#get-users-list)
	


# Auth

## Confirm email



	GET /api/v1/auth/confirm-email/:token


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
## Sign in



	POST /api/v1/auth/sign-in


### Examples

Request-Example:

```
{
  "login": "test@test.com",
  "password": "testtest"
}
```

## Sign up



	POST /api/v1/auth/sign-up


### Examples

Request-Example:

```
{
  "email": "test@test.com",
  "username": "test",
  "password": "testtest"
  "repeatPassword": "testtest"
}
```

## Forgot password



	POST /api/v1/auth/forgot-password


### Examples

Request-Example:

```
{
  "email": "test@test.com"
}
```

## Reset password



	POST /api/v1/auth/reset-password


### Examples

Request-Example:

```
{
  "token": "fb7ce9c3913ed08a0dfd45d4bc",
  "password": "testpass",
  "repeatPassword": "testpass"
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
| conditionsText			| String			| **optional** <p>Required only if conditions is empty</p>							|
| conditions			| Object[]			| **optional** <p>Conditions array</p>							|
| conditions.param			| String			| **optional** <p>result_place, win_time, frags</p>							|
| conditions.operator			| String			| **optional** <p>&gt;, &lt;, =, &gt;=, &lt;=</p>							|
| conditions.value			| Number			| **optional** <p>Can be integer number</p>							|
| conditions.join			| String			| **optional** <p>AND, OR or END. END can be used once</p>							|

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
  "conditionsText": [],
  "conditions": [{
    "param": "resultPlace",
    "operator": ">",
    "value": 1,
    "join": "END"
  }]
}
```

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
 "result": {
   "id": 11,
   "name": "test",
   "createdAt": "2019-06-02T06:11:44.866Z",
   "startDate": "2019-07-04T08:32:19.818Z",
   "endDate": null,
   "game": "pubg",
   "accessRule": "anyone",
   "ppyAmount": "1",
   "conditionsText": "test",
   "user": {
     "id": 1,
     "username": "username",
     "youtube": "",
     "facebook": "",
     "peerplaysAccountName": "",
     "bitcoinAddress": ""
   },
   "conditions": [{
     "id": 4,
     "param": "resultPlace",
     "operator": ">",
     "value": 1,
     "join": "OR",
     "createdAt": "2019-06-02T06:11:44.874Z",
     "updatedAt": "2019-06-02T06:11:44.874Z",
     "challengeId": 11
   }, {
     "id": 5,
     "param": "resultPlace",
     "operator": ">",
     "value": 1,
     "join": "END",
     "createdAt": "2019-06-02T06:11:44.875Z",
     "updatedAt": "2019-06-02T06:11:44.875Z",
     "challengeId": 11
   }],
   "invitedUsers": []
 },
 "status": 200
}
```
## Get challenge by id



	GET /api/v1/challenges/:id


### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
 "result": {
   "id": 11,
   "name": "test",
   "createdAt": "2019-06-02T06:11:44.866Z",
   "startDate": "2019-07-04T08:32:19.818Z",
   "endDate": null,
   "game": "pubg",
   "accessRule": "anyone",
   "ppyAmount": "1",
   "conditionsText": "test",
   "user": {
     "id": 1,
     "username": "username",
     "youtube": "",
     "facebook": "",
     "peerplaysAccountName": "",
     "bitcoinAddress": ""
   },
   "conditions": [{
     "id": 4,
     "param": "resultPlace",
     "operator": ">",
     "value": 1,
     "join": "OR",
     "createdAt": "2019-06-02T06:11:44.874Z",
     "updatedAt": "2019-06-02T06:11:44.874Z",
     "challengeId": 11
   }, {
     "id": 5,
     "param": "resultPlace",
     "operator": ">",
     "value": 1,
     "join": "END",
     "createdAt": "2019-06-02T06:11:44.875Z",
     "updatedAt": "2019-06-02T06:11:44.875Z",
     "challengeId": 11
   }],
   "invitedUsers": []
 },
 "status": 200
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
# Twitch

## Auth by twitch



	GET /api/v1/auth/twitch


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

