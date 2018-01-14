CREATE TABLE sales
(
    order_id character varying NOT NULL,
    customer_name character varying,
    product_details json,
    "timestamp" timestamp(1) without time zone DEFAULT NOW(),
    customer_email character varying,
    coupon_code character varying,
    transaction_id character varying,
    fulfilled boolean,
    value integer,
    PRIMARY KEY ("order_id")
);

CREATE TABLE coupons
(
    coupon_code character varying NOT NULL,
    email character varying NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    used boolean NOT NULL DEFAULT false,

    PRIMARY KEY ("coupon_code")
);
