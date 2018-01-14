const express = require('express');

const app = express();
var bodyParser = require('body-parser');
const Sales = require('./components/Sales.js');
const sales = new Sales();

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.get('/api', function(req, res) {
  res.send('This is the backend for the CompSoc website. k thanks bye.')
});

app.post('/api/sales/charge', function(req, res) {
  sales.charge(req, res);
});

app.post('/api/sales/coupon', function(req, res) {
  sales.couponCheck(req, res);
});

app.get('/api/alive', function(req, res) {
  res.send(JSON.stringify({alive: true, pk: process.env.STRIPE_KEY_PUBLIC}));
});

app.use('/', express.static('www/_site', { extensions: ["html"] })); // serve static website

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});