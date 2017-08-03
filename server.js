const express = require('express');
var stripe = require("stripe")(
  "sk_test_BQokikJOvBiI2HlWgH4olfQ2"
);
const app = express();
var bodyParser = require('body-parser');
var response = [];

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/api', function (req, res) {
  res.send('This is the backend for the CompSoc website. k thanks bye.')
});

app.post('/api/stripe/charge', function(req, res) {
  stripe.charges.create({
    amount: req.amount,
    currency: "gbp",
    source: req.token,
    description: req.description
  })
  .then(
    function(charge) {
      response.push({livemode: charge.livemode, result: 'charge'});
      if (charge.paid){
        response.push({
          success: true,
          id: charge.id,
          amount: charge.amount,
          message: charge.outcome.seller_message,
          outcome_type: charge.outcome.type
        })
      } else {
        response.push({
          success: false,
          id: charge.id,
          failcode: charge.failure_code,
          message: charge.failure_message,
          last4: charge.source.last4
        })
      }},
    function(err){
      response.push({
        result: 'error',
        success: false,
        err_type: err.type,
        err_msg: err.message
      });
    });
  res.send(JSON.stringify(response));
});

app.use('/', express.static('www/_site', { extensions: ["html"] })); // serve static website

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});