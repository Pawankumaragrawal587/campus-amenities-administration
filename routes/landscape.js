const express = require('express');
const router = express.Router();
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');
const mysqlQueriesLandscape = require('../mysqlQueries/landscape.js');

router.get('/landscape',function(req,res){
    res.render("landscape/index");
});

module.exports = router;