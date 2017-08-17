const express = require('express');

const app = express();
var bodyParser = require('body-parser');
var response = {};
var ApiStripe = require('./components/ApiStripe.js');

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.get('/api', function (req, res) {
  res.send('This is the backend for the CompSoc website. k thanks bye.')
});

app.post('/api/stripe/charge', function (req, res) { new ApiStripe().charge(req, res); });

app.use('/', express.static('www/_site', { extensions: ["html"] })); // serve static website

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});