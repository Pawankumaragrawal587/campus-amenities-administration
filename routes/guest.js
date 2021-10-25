const express = require('express');
const router = express.Router();
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');
const mysqlQueriesGuest = require('../mysqlQueries/guest.js');

router.get('/guest',function(req,res){
    res.render("guest/index");
});

module.exports = router;