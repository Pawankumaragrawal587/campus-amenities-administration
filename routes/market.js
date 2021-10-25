const express = require('express');
const router = express.Router();
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');
const mysqlQueriesMarket = require('../mysqlQueries/market.js');

router.get('/market',function(req,res){
    res.render("market/index");
});

module.exports = router;