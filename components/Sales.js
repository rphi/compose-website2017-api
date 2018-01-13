var ApiStripe = require('../components/ApiStripe.js');
const DataClass = require('../components/Data.js');
var Data = new DataClass();
var EmailUtils = require('../components/EmailUtils.js');
var shortid = require('shortid');
const HoodieUtils = require('../components/HoodieUtils.js');

class Sales {
  async charge(req, res) {
    res.set('Content-Type', 'text/javascript');
    //console.log(req.body);
    
    var discount = 0;

    if (req.body.coupon != ""){
      var response = await Data.query("SELECT 'used' FROM 'coupons' WHERE ('coupon_code' == $1)", [ req.body.coupon ])
        .then((res) => { return res; })
        .catch((reason) => {
          console.log(reason.stack);
          var response = {};
          response.result = 'error';
          response.success = false;
          response.err_type = "DB_error";
          response.err_msg = "Unable to verify coupon";
          console.log(JSON.stringify(response));
          res.send(JSON.stringify(response));
          return false;
        });
      if (!result) { return; }  // terminate if query failed
      if (result.length > 0) {
        if (!result[0].used)
        {
          if (result[0].email != req.token.email) {
            var response = {};
            response.result = 'error';
            response.success = false;
            response.err_type = "Not_Your_Coupon";
            response.err_msg = "The coupon code provided is not associated with your email address.";
            console.log(JSON.stringify(response));
            res.send(JSON.stringify(response));
            return;
          }
          if (!result[0].for_item == req.body.product){
            var response = {};
            response.result = 'error';
            response.success = false;
            response.err_type = "Invalid_Item";
            response.err_msg = "The coupon code provided is not valid for this item.";
            console.log(JSON.stringify(response));
            res.send(JSON.stringify(response));
            return;
          }
          discount = result[0].value;
        } else {
          var response = {};
          response.result = 'error';
          response.success = false;
          response.err_type = "Invalid_Coupon";
          response.err_msg = "You have already used the coupon code provided.";
          console.log(JSON.stringify(response));
          res.send(JSON.stringify(response));
          return;
        }
      } else {
        var response = {};
        response.result = 'error';
        response.success = false;
        response.err_type = "Invalid_Coupon";
        response.err_msg = "The coupon you have provided does not exist.";
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
        return;
      }
    }

    if (req.body.product == "hoodie"){
      var hu = new HoodieUtils();
      if (hu.checkPrice(req.body.productData.code, (req.body.amount + discount)) == false) {
        var response = {};
        response.result = 'error';
        response.success = false;
        response.err_type = "Item_Price_Mismatch";
        response.err_msg = "The price in your request does not match the product's real price.";
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
        return;
      }
    }

    var orderId = shortid.generate();

    var qresult = await Data.query(
      "INSERT INTO sales (\"orderId\", \"customerName\", \"productDetails\", \"customerEmail\", \"couponCode\", \"transactionToken\", fulfilled, value) VALUES ($1, $2, $3, $4, $5, $6, $7);",
      [orderId, req.body.productData.customer, req.body.productData, req.body.token.email, req.body.coupon, null, false, req.body.amount]
      )
      .then((res) => { return true; })
      .catch((reason) => {
        console.log(reason.stack);
        var response = {};
        response.result = 'error';
        response.success = false;
        response.err_type = "DB_Write_Error_Precharge";
        response.err_msg = "Error writing order details to database. Your card has not been charged.";
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
        return false;
      });
    
    if (qresult == false) { return; } // terminate here if error

    var stripeResponse = await new ApiStripe().createCharge(req.body.amount, req.body.token, req.body.productData.description);

    if (!stripeResponse.success) {
      res.send(JSON.stringify(stripeResponse));
      return;
    }

    var qresult = await Data.query("UPDATE sales SET \"transactionId\" = $1 WHERE (\"orderId\" = $2);", [req.body.coupon, orderId])
      .then((res) => { return true; })
      .catch(function(reason){
        console.log(reason.stack);
        var response = {};
        response.result = 'error';
        response.success = false;
        response.err_type = "DB_Write_Error_Postcharge";
        response.err_msg = "Error marking order as paid. Your card has been charged. Contact hello[@]comp-soc.com for help quoting order ID " + orderId + " and transactionId " + stripeResponse.transactionId + ".";
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
        return false;
      });
    
    if (qresult == false) { return; } // terminate here if error

    Data.query("UPDATE coupons SET used = true WHERE (\"coupon_code\" = $1);", [req.body.coupon])
      .catch(function(err){
        console.log(err.stack);
        // no need to tell the user about this one... probably better they didn't know.
      });

    var emailContent;

    switch (req.body.product){
      case ('hoodie'):
        emailContent = new HoodieUtils().createEmailContent(req.body.productData, discount, orderId, stripeResponse);
        break;
      default:
        emailContent = {};
        break;
    }

    new EmailUtils().sendMail('Thanks for your recent purchase!', emailContent, req.body.token.email);

    var response = {
      success: true,
      result: 'charge',
      id: stripeResponse.id,
      amount: stripeResponse.amount,
      message: stripeResponse.message,
      outcome_type: stripeResponse.outcome_type,
      last4: stripeResponse.last4
    };
    res.send(JSON.stringify(response));
  }

  async couponCheck(req, res) {
    var response = {};
    if (req.body.coupon = ""){
      response.success = false;
      response.error = "No coupon code provided.";
    }

    Data.query("SELECT 'used' FROM coupons WHERE ('coupon_code' = $1)", [ req.body.coupon ])
    .then(function(dbres){
      if (dbres.length > 0) {
        if (!dbres[0].used) {
          if (dbres[0].for_item != req.body.item) {
            response.success = true;
            response.valid = false;
            response.reason = "This coupon is not valid for this item.";
          }
          response.success = true;
          response.valid = true;
        } else {
          response.success = true;
          response.valid = false;
          response.reason = "This coupon has already been used.";
        }
      } else {
        response.success = true;
        response.valid = false;
        response.reason = "This coupon does not exist."
      }
      res.send(JSON.stringify(response));
    })
    .catch(function(err) {
      console.log(err.stack);
      response.success = false;
      response.error = "Error communicating with database.";
      res.send(JSON.stringify(response));
    });
  }
}

module.exports = Sales;