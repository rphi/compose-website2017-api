const stripe = require("stripe")(
  "sk_test_BQokikJOvBiI2HlWgH4olfQ2"
);

class ApiStripe {
  createCharge(amount, token, description) {
    var response = {};
    return stripe.charges.create({
      amount: amount,
      currency: "gbp",
      source: token.id,
      description: description
    })
    .then(
      function(charge) {
        response.livemode = charge.livemode;
        response.result = 'charge';
        if (charge.paid){
          response.success = true;
          response.id = charge.id;
          response.amount = charge.amount;
          response.message = charge.outcome.seller_message;
          response.outcome_type = charge.outcome.type;
          response.last4 = charge.source.last4;
        } else {
          response.success = false;
          response.id = charge.id;
          response.failcode = charge.failure_code;
          response.message = charge.failure_message;
          response.last4 = charge.source.last4;
        }},
      function(err){
          response.result = 'error';
          response.success = false;
          response.err_type = err.type;
          response.err_msg = err.message;
      })
      .then(
        function(){
          console.log(response);
        }
      )
      .return(response);
  }
}

module.exports = ApiStripe;