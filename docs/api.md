# streamers-edge v0.1.0

Backend module for StreamersEdge application

- [Admin](#admin)
	- [Get authorized admin profile](#get-authorized-admin-profile)
	
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
	- [Invite user to new challenge](#invite-user-to-new-challenge)
	- [Subscribe to new notification](#subscribe-to-new-notification)
	
- [Facebook](#facebook)
	- [Auth by facebook](#auth-by-facebook)
	
- [Google](#google)
	- [Auth by google](#auth-by-google)
	
- [Profile](#profile)
	- [Create peerplays account for authorized user](#create-peerplays-account-for-authorized-user)
	- [Delete profile avatar](#delete-profile-avatar)
	- [Get authorized user profile](#get-authorized-user-profile)
	- [Update authorized user profile](#update-authorized-user-profile)
	- [Add or change account avatar](#add-or-change-account-avatar)
	
- [Stream](#stream)
	- [Get stream](#get-stream)
	- [Get streams](#get-streams)
	- [Get Streams for users from Twitch](#get-streams-for-users-from-twitch)
	
- [Twitch](#twitch)
	- [Auth by twitch](#auth-by-twitch)
	
- [Users](#users)
	- [Change notification status](#change-notification-status)
	- [Get user by id](#get-user-by-id)
	- [Get users list](#get-users-list)
	


# Admin

## Get authorized admin profile

<p>Get profile of authorized admin</p>

	GET /api/v1/admin/profile


### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "status": 200,
  "result": {
    "id": "5cc315041ec568398b99d7ca",
    "username": "test",
    "email": "test@email.com",
    "twitchUserName": "",
    "googleName": "",
    "avatar": "",
    "youtube": "",
    "facebook": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": "",
    "userType": "viewer"
  }
}
```
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
## Invite user to new challenge



	POST /api/v1/challenges/invite


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| userId			| Number			|  <p>Invited user Id</p>							|
| challengeId			| Number			|  <p>Id of of challenge</p>							|

### Examples

Request-Example:

```
{
  "userId": "6",
  "challengeId": "107",
}
```

## Subscribe to new notification



	POST /api/v1/challenges/subscribe


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| endpoint			| String			|  <p>url for user</p>							|
| expirationTime			| Number			|  <p>time of expiration</p>							|
| keys			| Object			|  <p>object</p>							|
| keys.p256dh			| String			| **optional** <p>string in p256dh</p>							|
| keys.auth			| String			| **optional** <p>auth string</p>							|

### Examples

Request-Example:

```
{
  endpoint: 'https://fcm.googleapis.com/...lbTgv66-WEEWWK9bxZ_ksHhV_Z49vBvnYZdeS6cL6kk',
  expirationTime: null,
  keys:
   {
     p256dh: 'BOQWqnde....j7Dk-o',
     auth: 'EYFQS0dh2KaPMXx9nmVPww'
   }
}
```

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
 "result": "BOQWqndev7VP-UCLv9QIqDtkcNwRjyu4QBPDTCymL6ILHWklqWP1XxXRLmAYywsfgGs7K8Yub_6jQKiN0j7Dk-o",
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
    "id": 7,
    "username": "test",
    "email": "test@email.com",
    "twitchUserName": "",
    "googleName": "",
    "youtube": "",
    "facebook": "",
    "twitch": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": "",
    "userType": "viewer",
    "avatar": ""
 }
}
```
## Delete profile avatar



	DELETE /api/v1/profile/avatar


### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "status": 200,
  "result": {
    "id": 7,
    "username": "test",
    "email": "test@email.com",
    "twitchUserName": "",
    "googleName": "",
    "youtube": "",
    "facebook": "",
    "twitch": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": "",
    "userType": "viewer",
    "avatar": ""
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
    "id": 7,
    "username": "test",
    "email": "test@email.com",
    "twitchUserName": "",
    "googleName": "",
    "youtube": "",
    "facebook": "",
    "twitch": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": "",
    "userType": "viewer",
    "avatar": ""
 }
}
```
## Update authorized user profile



	PATCH /api/v1/profile


### Examples

Request-Example:

```
{
  "avatar": "",
  "youtube": "",
  "facebook": "",
  "peerplaysAccountName": "",
  "bitcoinAddress": "",
  "userType": "viewer"
}
```

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "status": 200,
  "result": {
    "id": 7,
    "username": "test",
    "email": "test@email.com",
    "twitchUserName": "",
    "googleName": "",
    "youtube": "",
    "facebook": "",
    "twitch": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": "",
    "userType": "viewer",
    "avatar": ""
 }
}
```
## Add or change account avatar



	POST /api/v1/profile/avatar


### Examples

Request-Example:

```
"file": ...file...
```

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "status": 200,
  "result": {
    "id": 7,
    "username": "test",
    "email": "test@email.com",
    "twitchUserName": "",
    "googleName": "",
    "youtube": "",
    "facebook": "",
    "twitch": "",
    "peerplaysAccountName": "",
    "bitcoinAddress": "",
    "userType": "viewer",
    "avatar": ""
 }
}
```
# Stream

## Get stream

<p>Get Stream by StreamId</p>

	GET /api/v1/stream/:id


### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "result": {
  "id": 1,
  "name": "TSM chocoTaco | today's weather: thirsty",
  "game": "pubg",
  "sourceName": "twitch",
  "embedUrl": "",
  "channelId": "34608843376",
  "views": 3536,
  "isLive": true,
  "startTime": "2019-06-21T00:09:40.000Z",
  "thumbnailUrl": "https://static-cdn.jtvnw.net/previews-ttv/live_user_chocotaco-{width}x{height}.jpg",
  "user": {
      "id": 10,
      "username": "jotprabh",
      "email": "prabhjot.narula@gmail.com",
      "twitchUserName": null,
      "googleName": null,
      "youtube": "",
      "facebook": "",
      "peerplaysAccountName": "",
      "bitcoinAddress": "",
      "userType": null
    }
  },
  "status": 200
}
```
## Get streams

<p>Get Streams</p>

	GET /api/v1/streams


### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "result": [
      {
          "id": 1,
          "name": "TSM chocoTaco | today's weather: thirsty",
          "game": "pubg",
          "sourceName": "twitch",
          "embedUrl": "",
          "channelId": "34608843376",
          "views": 3536,
          "isLive": true,
          "startTime": "2019-06-21T00:09:40.000Z",
          "thumbnailUrl": "https://static-cdn.jtvnw.net/previews-ttv/live_user_chocotaco-{width}x{height}.jpg",
          "user": {
              "id": 10,
              "username": "jotprabh",
              "email": "prabhjot.narula@gmail.com",
              "twitchUserName": null,
              "googleName": null,
              "youtube": "",
              "facebook": "",
              "peerplaysAccountName": "",
              "bitcoinAddress": "",
              "userType": null
          }
      }
  ],
  "status": 200
}
```
## Get Streams for users from Twitch



	GET /api/v1/stream/populate-twitch-streams


### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "status": 200,
  "result": true
}
```
# Twitch

## Auth by twitch



	GET /api/v1/auth/twitch


# Users

## Change notification status



	PATCH /api/v1/users/setNotification


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| set			| Boolean			|  <p>notification for user</p>							|

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "result": [1],
  "status": 200
}
```
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

