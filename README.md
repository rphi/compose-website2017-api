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
 - `STRIPE_KEY_PRIVATE`
 - `STRIPE_KEY_PUBLIC`
 - `PGUSER`
 - `PGHOST`
 - `PGDATABASE`
 - `PGPASSWORD`
 - `PGPORT`

## Database

This is configured to use a PostgreSQL database with  the following schema:

```
CREATE TABLE sales
(
    "orderId" character varying NOT NULL,
    "customerName" character varying,
    "productDetails" json,
    "timestamp" timestamp(1) without time zone DEFAULT NOW(),
    "customerEmail" character varying,
    "couponCode" character varying,
    "transactionId" character varying,
    fulfilled boolean,
    value integer,
    PRIMARY KEY ("orderId")
);

CREATE TABLE coupons
(
    "coupon_code" character varying NOT NULL,
    "email" character varying NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    used boolean NOT NULL DEFAULT false,

    PRIMARY KEY ("coupon_code")
);
```