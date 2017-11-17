var ApiStripe = require('../components/ApiStripe.js');
const DataClass = require('../components/Data.js');
var Data = new DataClass();

class HoodieUtils {
  constructor(){
    this.priceList = {
      'JH001': 2500,
      'JH01F': 2500,
      'JH050': 2700,
      'JH055': 2700
    }
  }
  
  checkPrice(prodCode, price) {
    if (this.priceList[prodCode] == price) { return true; }
    return false;
  }
}

class Sales {
  async charge(req, res) {
    res.set('Content-Type', 'text/javascript');
    console.log(req.body);
    
    var discount = 0;

    if (req.body.coupon != ""){
      try {
        var result = Data.pool.query("SELECT 'used' FROM 'coupons' WHERE ('couponCode' == $1)", [ req.body.coupon ]);
      } catch(err) {
        console.log(err.stack);
        var response = {};
        response.result = 'error';
        response.success = false;
        response.err_type = "DB_error";
        response.err_msg = err.stack;
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
        return;
      }

      if (result.length > 0) {
        if (!result[0].used)
        {
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

    if (req.body.productData.product == "hoodie"){
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

    var stripeResponse = await new ApiStripe().createCharge(req.body.amount, req.body.token, req.body.productData.description);

    if (stripeResponse.success) {
      try {
        Data.pool.query(
          "INSERT INTO sales (\"transactionToken\", \"customerName\", \"productDetails\", \"customerEmail\", \"couponCode\", fulfilled) VALUES ($1, $2, $3, $4, $5, $6);",
          //["test", "test", "{}", "1999-01-08 04:05:06", 'test', '', false]
          [stripeResponse.id, req.body.productData.customer, req.body.productData, req.body.token.email, req.body.coupon, false]
          );
      } catch (err) {
        console.log(err.stack);
        var response = {};
        response.result = 'error';
        response.success = false;
        response.err_type = "DB_Write_error";
        response.err_msg = err.stack;
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
        return;
      }
      try {
        Data.pool.query("UPDATE coupons SET used = true WHERE (\"couponCode\" = $1);", [req.body.coupon]);
      } catch (err) {
        console.log(err.stack);
        var response = {};
        response.result = 'error';
        response.success = false;
        response.err_type = "DB_Write_error";
        response.err_msg = err.stack;
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
        return;
      }
    }

    res.send(JSON.stringify(stripeResponse));
    return;
  }

  async couponCheck(req, res) {
    var response = {};
    if (req.body.coupon = ""){
      response.success = false;
      response.error = "No coupon code provided.";
    }

    try {
      var result = Data.pool.query("SELECT 'used' FROM 'coupons' WHERE ('couponCode' == $1)", [ req.body.coupon ]);
    } catch(err) {
      console.log(err.stack);
      response.success = false;
      response.error = "Error communicating with database.";
    }

    if (result.length > 0) {
      if (!result[0].used) {
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
  }
}

module.exports = Sales;