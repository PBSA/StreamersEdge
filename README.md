# StreamersEdge

## API Documentation

You can find API documentation here - [/docs/api.md](/docs/api.md)

Also you can build the HTML version of documentation. Just run npm run `build:apidoc`
and documentation will be built into `apidoc` folder.

## Dependency
1. Docker & Docker-Compose

2. NVM <br>
https://github.com/nvm-sh/nvm

3. Start the dependencies (Postgres) 
```bash 
   docker-compose -f docker_dependencies.yml up
```

## Development

For development you can use nodemon. Clone this project into your folder and run the following commands to run the backend:

```bash
nvm use  # switch to node version as in .nvmrc file
npm run serve # start server with nodemon
```

Before you will commit your changes in the repository you should check your code on audit and code mistakes:

```bash
npm run test:audit # it will check vulnerable dependencies
npm run test:linter # it will check code style
npm run test:mocha # this command will run mocha tests
```

If you want to check the coverage of code tests, just run `npm run test:coverage`.
### Commits

> If you have run the init script, you can commit via `git cz`.  
> If you have not run the init script, you must commit via `npm run commit`.  
> If you do neither, commit message consistency will be difficult for you.

This repository uses a combination of tools to aid in consistent commit messages. The reason we do this is so we can have dynamic changelog creation and smart semantic versioning based on commits (with the ability to override).

The following tools are used:

1. [commitizen](https://www.npmjs.com/package/commitizen)  
   Used for prompting recommended entries within a commit message to ensure it contains the necessary information.
   - [conventional changelog](https://www.npmjs.com/package/cz-conventional-changelog)  
     - Prompts for conventional changelog standard.
2. [husky](https://www.npmjs.com/package/husky)  
   By using the hooks from this package we intercept commits being made and verify them with commitlint.
   - Prevent bad commits/pushes.
3. [commitlint](https://www.npmjs.com/package/@commitlint/cli)
   - cli
   - [config-conventional](https://www.npmjs.com/package/@commitlint/config-conventional)
     - rule preset in use

### Releases

This repository uses a [standard version](https://www.npmjs.com/package/standard-version) to aid in version control and release management.

When using standard version to cut a release, there is automated changelog modifitions made based on commit messages.

```csharp
// If you typically use npm version to cut a new release, do this instead:
npm run release
npm run release:pre // cut a pre-release in the format v0.2.1-alpha.0
npm run release:minor // cut a new release with semantic minor bump
```

## Migrations & Seeds

To run all pending migrations
```yarn db-migrate-all```

To undo single migrations
```yarn db-migrate-undo```

To undo all migrations BE CAREFUL
```yarn db-migrate-undo```

To run all Seeds. Seeds can be run multiple times and should be used for dev only
```yarn db-seed-all```

To undo single migrations
```yarn db-seed-undo-all```

## Testing

1. Copy all the required configurations from development.json to test.json
2. Make sure to point towards different database that development
3. If this is first time, create a database for test as mentioned in test.json
4. Run all migrations for test db
```NODE_ENV=test yarn db-migrate-all```  

## Docker

You can run the application with docker-compose:

```bash
docker-compose up --build
```

## Project configuration 

### AWS S3 Credentials

The server uses AWS S3 to store user-uploaded avatars. To grant server 
permissions to upload files, you must pass the following variables to 
environment variables:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN (optional)
```

For provide public access to files in Bucket you can add next policy: 

```
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Sid":"AddPerm",
      "Effect":"Allow",
      "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::simplified-guide/*"]
    }
  ]
}
``` 
