# Node Mongo GraphQL Boilerplate
This repository is a boilerplate using below technologies
* Node JS (ES6)
* MongoDB (Database)
* Mongoose (Data Model for Mongo)
* GraphQL
* Docker
* Mocha (Unit Testing)
* apidoc (Documentation)
* graphidocs/docs (GraphQL Documentation)
* ESLint (Linting Utility)
* typescript (SHOULD BE ADDED)
* Graphql-doc

## Folder-Structure
There are several folders in this project: 
* config
* db
* middlewares
* models
* tests
* graphql
* resolvers
* schema

### config 
This folder will be in charge of the server configuration for the following environments:
* developement
* test
* production (no need to keep production data in the file. Data for production is only located in the production server)


We will put all the configurations here so any changes in different environment will be made here only. This folder will have two files. `config.json` and `config.js`

`config.json` is a simple JSON or maybe BSON and will hold key information for different environments. `config.js` file will decide which environment we are and based on that it will load the details of that environment into the environment variables of the machine.

As it can be seen in the `config.js` file, the environment variable of `NODE_ENV` is not defined locally. So what happens is that it will get the details from the `config.json` file (either *TEST* or *DEVELOPMENT* environment) and will load the details, create those environment variables and load the values into them. As it can be seen by default the value is development as `NODE_ENV` does not exist. But if we want to push test we should do it by test script inside the package.json file. Later we will go through its details.

Currently it holds info for only the Environment name, MongoDB URL, Port Number and JWT Secret key.
### db
This folder will hold a file for our database connection. We can name the file `mongoose.js`.

### middleware 
This folder will hold our middlewares for example authenticate middleware or log middle or anything you might have in mind you can keep here.

### model
All data models will be saved in this folder. They are basically mongoose schema.

### test
This folder will hold our test scripts using `mocha`, `expect`, `supertest` and `nodemon`. Inside test folder, we should have another folder called seed (`seed.js`) which will push in data for us before our tests. It is very useful. All tests for the `server.js` file will also go into `server.test.js` file located in test folder.
Test should be updated as graphQL will be added into the project

### graphql
This folder will be the core of the APIs and will hold all the resolvers and schemas
Each category resolver such as customers, orders, etc will have its own file. Each file will handle both queries and mutations.
`index.js` file in the resolver folder will hold all the resolvers. rootValue of the express graphql will use this file for all resolvers. 
It is the same with `index.js` in schema folder which will hold all schemas we have for the project
`merger.js` will be used to query the relations of the collections instead of populating them. Example will be provided soon

###helpers
This folder will hold all the helper methods we will use throughout the project.

## Run, Test and document the project `WITH DOCKER`
Clone the project from the repository and use and install the dependencies using below command
```sh
npm install
```
Then use docker command as below
```sh
docker-compose up -d
```
For TEST environment, all you need is to check the logs on the test container using below command
```sh
docker logs -f boilerplate_test
```

For DEV environment, you can check the logs of the DEV container using below command
```sh
docker logs -f boilerplate_apis
```
When you `Server started and listening to Port 3000` message, then open a browser and go to http://localhost:3000/graphql

## Run, Test and document the project without Docker
After cloning the project install the dependencies
```sh
npm install
```
Be sure you already have mongodb installed and running.
Modify the `config.json` file to proper settings. Be sure you will configure it for dev and test environment.

To test the app simply run below command
```sh
npm test
```

To run the app simply run below command
```sh
npm start
```

Documentation are not part of the app repository but it can be generated easily. 
Open the `server.js` file and look at the commented section above the main endpoint ('/'). It is a sample of how other API endpoints should look like. When you create a new endpoint, simply copy and paste text here and line by line modify it.
After you are done with documentation run below commande to generate the documentation folder on your root folder
```sh
npm run update-doc
```
After documentation is generated/updated, go to `documentations` folder and open `index.html` file in your browser.

For documenting graphql schemas, queries and mutations, you have to be sure to instal @graphidocs/docs globally using below command
```sh
npm install -g @graphidocs/docs
```
After that just simply run 
```sh
graphidocs
```
It will create a folder called `documentations` in the project root. Go to the folder and open `index.html` file.
Positive point for this documentation library is that any schema you select, it will show you the selected schema is also used in other schemas. 

## ESLint
Linter configuration file is `.eslintrd.json` and it is important everyone follows the same styling as required. (This section will get updated)
To ensure the code is already in compliance with the rules run below command

```sh
npm run eslint
```

And if there are issues related to the rules they can be fixed by running below command

```sh
npm run eslint-fix
```

## Unit Testing Scripts
What should be tested?

1. Schema Types
2. Mongoose Models
2. Resolvers
3. GraphQL Endpoint

### Testing Schema
Be sure it has all types in the Schema. This test should include the input, queries and mutations and their returned values

### Testing Mongoose Models
Check the numbers of all fields in the model
Be sure the required properties are indeed required
Check the validity of the fields. For example, if there is `enum` for data entry, be sure it is tested or if there is an email properties with validate function, that should also be tested with wrong and right values.

### Testing Resolvers
Resolvers are direct match with Queries and Mutationsare defined in the schema files and they are just functions. Our test scripts should test both failed and success scenarios. 
For mutations, be sure you run the funciton and read from the test database to be sure the change was applied. 
For Queries, be sure you already have a value in your database and what you read is exactly the same as you had in it.

### Testing Graphql Endpoint
It is similar to step two but this time, we should send an actual request to the graphql endpoint with a proper query parameter for both queries and mutations.

### Test Coverage
To see the test coverage run below command
```sh
npm run coverage
```
This command runs the test scripts and also gives you the test coverage at the end

## Getting a Token for Testing purposes
#Below instruction is temporary and should be removed when Creating Accounts and Login are in place.

Install Mod Header extension on your Chrome
`https://chrome.google.com/webstore/detail/modheader/idgpnmonknjnojddfkpgkljpfnnfcklj`
Open your browsers and go to `localhost:3000/graphql`
Copy and paste below command in the Graphiql tool
```sh
query {
  login
}
```
You will get a token. Copy the token and open the `ModHeader` on your browser and add a request header like below format
Key: Authorization
Value: Basic TOKEN_YOU_COMPIED_EARLIER

Example would be
`Authorization Basic JWT_EXAMPLE`

Now you can use mutations starving saveCustomer