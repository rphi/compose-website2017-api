# Compsoc Website 2017 API

A Node backend for the Compsoc Edinburgh website for 2017

## Running server (DEV)

Just run `yarn install` followed by `yarn start` to start a copy of the ExpressJS server.

For development the `yarn run start-watch` script may be handy as it uses Nodemon.io to watch
for changes to the server source and reload the application automatically.

Remember to setup the environment variables detailed in 'Configuration' below.

## Running server (PROD)

There is a Dockerfile that uses Phusion Passenger to start the application.

Run `docker-compose up` to build and execute a docker container with a 
production-ready configuration of the application. Also ensure that you have configured the env variables in `docker_env.env`.

## Configuration

This application uses environment variables to store credentials for other services. These are detailed
below:

 - `MAILGUN_API_KEY`
 - `MAILGUN_API_DOMAIN`
 - `STRIPE_KEY_SECRET`
 - `STRIPE_KEY_PUBLIC`
 - `PG_USER`
 - `PG_HOST`
 - `PG_DATABASE`
 - `PG_PASSWORD`
 - `PG_PORT`

## Database

This is configured to use a PostgreSQL database with the schema provided in `setup.pgsql`.
