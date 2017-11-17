const express = require('express');

const app = express();
var bodyParser = require('body-parser');
var Sales = require('./components/Sales.js');

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.get('/api', function (req, res) {
  res.send('This is the backend for the CompSoc website. k thanks bye.')
});

app.post('/api/sales/charge', function (req, res) { new Sales().charge(req, res); });

app.post('/api/sales/coupon', function(req, res) { new Sales().couponCheck(req, res); });

//app.post('/api/data/addnew', function (req, res) { Data.addUser(req, res) });

app.use('/', express.static('www/_site', { extensions: ["html"] })); // serve static website

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});