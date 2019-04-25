# Auth with twitch mechanism

Authorization with twitch has 5 steps:

1. The front receives a new redirect URL
1. The front redirects a user to received URL
1. Twitch returns the user to the front with auth token after Auth
1. The front sends the token to the backend
1. Backend receives user info by token and returns a response with session authentication

![Auth process](./fronted-auth-steps.png)
