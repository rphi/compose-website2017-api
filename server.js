const express = require('express');
var stripe = require("stripe")(
  "sk_test_BQokikJOvBiI2HlWgH4olfQ2"
);

const app = express();
var bodyParser = require('body-parser');
var response = {};

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.get('/api', function (req, res) {
  res.send('This is the backend for the CompSoc website. k thanks bye.')
});

app.post('/api/stripe/charge', function(req, res) {
  res.set('Content-Type', 'text/javascript');
  console.log(req.body.token);
  stripe.charges.create({
    amount: req.body.amount,
    currency: "gbp",
    source: req.body.token.id,
    description: req.body.description
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
      function() {
        console.log(JSON.stringify(response));
        res.send(JSON.stringify(response));
      }
    );
});

app.use('/', express.static('www/_site', { extensions: ["html"] })); // serve static website

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});