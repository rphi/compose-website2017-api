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
