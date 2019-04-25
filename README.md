# StreamersEdge

## Development

For development you can use nodemon. Clone this project into your folder and run the following commands to run the backend:

```bash
npm i # install dependencies
npm run migrate # run database migrations
npm run serve # start server with nodemon
```

Before you will commit your changes in the repository you should check your code on audit and code mistakes:

```bash
npm run test:audit # it will check vulnerable dependencies
npm run test:linter # it will check code style
npm run test:mocha # this command will run mocha tests
```

If you want to check the coverage of code tests, just run `npm run test:coverage`.

## Migrations

<!--TODO: Should be described-->

## Docker

You can run the application with docker-compose:

```bash
docker-compose up --build
```
