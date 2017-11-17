CREATE TABLE sales
(
    "transactionToken" character varying NOT NULL,
    "customerName" character varying,
    "productDetails" json,
    "timestamp" timestamp(1) without time zone DEFAULT NOW(),
    "customerEmail" character varying,
    "couponCode" character varying,
    fulfilled boolean,
    value integer,
    PRIMARY KEY ("transactionToken")
);

CREATE TABLE coupons
(
    "couponCode" character varying NOT NULL,
    "userEmail" character varying NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    used boolean NOT NULL,

    PRIMARY KEY ("couponCode")
);