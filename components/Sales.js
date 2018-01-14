var ApiStripe = require('../components/ApiStripe.js');
const DataClass = require('../components/Data.js');
var Data = new DataClass();
var EmailUtils = require('../components/EmailUtils.js');
var shortid = require('shortid');
const HoodieUtils = require('../components/HoodieUtils.js');

class Sales {
  async charge(req, res) {
    res.set('Content-Type', 'text/javascript');
    // console.log(req.body);

    var discount = 0;

    if (req.body.coupon !== "") {
      // get the coupon code
      const result = await Data.query("SELECT * FROM coupons WHERE coupon_code = $1", [req.body.coupon])
        .then(result => result)
        .catch(reason => {
          console.log(reason.stack);

          const response = {};
          response.result = 'error';
          response.success = false;
          response.err_type = "DB_error";
          response.err_msg = "Unable to verify coupon";

          console.log(JSON.stringify(response));
          res.send(JSON.stringify(response));
          return false;
        });

      // Terminate if query failed
      if (!response) {
        return;
      }

      const rows = result.rows;
      const coupon = rows[0];
      const response = {
        success: false,
      };

      if (rows.length === 0) {
        response.result = 'error';
        response.err_type = "Invalid_Coupon";
        response.err_msg = "The coupon you have provided does not exist.";
      } else if (coupon.used) {
        response.result = 'error';
        response.err_type = "Invalid_Coupon";
        response.err_msg = "You have already used the coupon code provided.";
      } else if (coupon.email !== req.token.email) {
        response.result = 'error';
        response.err_type = "Not_Your_Coupon";
        response.err_msg = "The coupon code provided is not associated with your email address.";
      } else if (result[0].for_item !== req.body.product) {
        response.result = 'error';
        response.err_type = "Invalid_Item";
        response.err_msg = "The coupon code provided is not valid for this item.";
      } else {
        discount = coupon.value;
        response.success = true;
      }

      // If it's not a success, lets return our response
      if (!response.success) {
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
        return;
      }
    }

    if (req.body.product == "hoodie") {
      const hu = new HoodieUtils();

      // Check to see if the amount matches.
      if (!hu.checkPrice(req.body.productData.code, req.body.amount + discount)) {
        // Craft an error respnose
        const response = {};
        response.result = 'error';
        response.success = false;
        response.err_type = "Item_Price_Mismatch";
        response.err_msg = "The price in your request does not match the product's real price.";

        // Send response
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
        return;
      }
    }

    // Generate a pretty much unique order ID
    const orderId = shortid.generate();

    // Attempt into insert the pending transaction
    let qresult = await Data.query(
      `
        INSERT INTO sales (
          order_id, customer_name, product_details, customer_email,
          coupon_code, transaction_id, fulfilled, value
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `,
      [orderId, req.body.productData.customer, req.body.productData, req.body.token.email, req.body.coupon, null, false, req.body.amount]
    )
      .then(() => true)
      .catch(reason => {
        console.log(reason.stack);

        const response = {};
        response.result = 'error';
        response.success = false;
        response.err_type = "DB_Write_Error_Precharge";
        response.err_msg = "Error writing order details to database. Your card has not been charged.";

        // Send response
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
        return false;
      });

    // Terminate here if error
    if (!qresult) {
      return;
    }

    const stripeResponse = await new ApiStripe().createCharge(req.body.amount, req.body.token, req.body.productData.description);
    console.log(stripeResponse);
    // Check if stripe succeeded.
    if (!stripeResponse.success) {
      Data.query("delete from sales where order_id = $1", [orderId]);
      res.send(JSON.stringify(stripeResponse));
      return;
    }

    qresult = await Data.query("UPDATE sales SET transaction_id = $1 WHERE (order_id = $2);", [stripeResponse.id, orderId])
      .then(() => true)
      .catch(reason => {
        console.log(reason.stack);

        const response = {};
        response.result = 'error';
        response.success = false;
        response.err_type = "DB_Write_Error_Postcharge";
        response.err_msg = "Error marking order as paid. Your card has been charged. Contact hello@comp-soc.com for help quoting order ID " + orderId + " and transaction_id " + stripeResponse.transaction_id + ".";

        // Send response
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
        return false;
      });
    
    // Terminate if error
    if (!qresult) {
      return;
    }

    Data.query("UPDATE coupons SET used = true WHERE coupon_code = $1;", [req.body.coupon])
      .catch(err => {
        console.log(err.stack);
        // no need to tell the user about this one... probably better they didn't know.
        // haha
      });

    let emailContent;
    switch (req.body.product){
      case ('hoodie'):
        emailContent = new HoodieUtils().createEmailContent(req.body.productData, discount, orderId, stripeResponse);
        break;
      default:
        emailContent = {};
        break;
    }

    new EmailUtils().sendMail('Thanks for your recent purchase!', emailContent, req.body.token.email);

    const response = {
      success: true,
      result: 'charge',
      id: stripeResponse.id,
      amount: stripeResponse.amount,
      message: stripeResponse.message,
      outcome_type: stripeResponse.outcome_type,
      last4: stripeResponse.last4,
    };
    res.send(JSON.stringify(response));
  }

  couponCheck(req, res) {
    let response = {};

    // No coupon provided? Error.
    if (req.body.coupon === ""){
      response.success = false;
      response.valid = false;
      response.error = "No coupon code provided.";

      // Send response
      res.send(JSON.stringify(response));
      return;
    }

    Data.query("SELECT * FROM coupons WHERE coupon_code = $1", [req.body.coupon])
      .then(resp => {
        const rows = resp.rows;

        // Does the coupon exist?
        if (rows.length === 0) {
          response.success = true;
          response.valid = false;
          response.reason = "This coupon does not exist.";

          // Send response
          res.send(JSON.stringify(response));
          return;
        }

        // Our particular coupon
        const coupon = rows[0];

        // Has the coupon been used before?
        if (coupon.used) {
          response.success = true;
          response.valid = false;
          response.reason = "This coupon has already been used.";

          // Send response
          res.send(JSON.stringify(response));
          return;
        }

        // Is this coupon for the right item?
        if (coupon.for_item !== req.body.item) {
          response.success = true;
          response.valid = false;
          response.reason = "This coupon is invalid.";

          // Send response
          res.send(JSON.stringify(response));
          return;
        }

        // Finally! We can buy this item.
        response.success = true;
        response.valid = true;

        // Send response
        res.send(JSON.stringify(response));
        return;
      })
      .catch(err => {
        console.log(err.stack);
        response.success = false;
        response.error = "Error communicating with database.";

        // Send response
        res.send(JSON.stringify(response));
        return;
      });
  }
}

module.exports = Sales;