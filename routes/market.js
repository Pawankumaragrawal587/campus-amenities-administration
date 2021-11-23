const express = require('express');
const router = express.Router();
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');
const mysqlQueriesMarket = require('../mysqlQueries/market.js');

router.get('/market',function(req,res){
    res.render("market/index");
});

router.get('/market/shopBooking',function(req,res){
    res.render("market/shopBooking");
});

router.get('/market/shopRentingRequests',function(req,res){
    res.render("market/shopRentingRequests");
});

router.get('/market/billPaymentform',function(req,res){
    res.render("market/billPaymentform");
});

router.get('/market/billPaymentRequests',function(req,res){
    res.render("market/billPaymentRequests");
});

router.get('/market/feedbackform',function(req,res){
    res.render("market/feedbackform");
});
module.exports = router;
