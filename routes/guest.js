const express = require('express');
const router = express.Router();
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');
const mysqlQueriesGuest = require('../mysqlQueries/guest.js');

router.get('/guest',function(req, res){
    res.render("guest/index");
});

router.get('/guest/roomBooking',function(req, res){
    mysqlConnection.query(mysqlQueriesGuest.roomAvailabilityQuery(req.query), function(err, results){
        if(err) {
            console.log(err);
            res.redirect('/guest/roomBooking');
        } else {
            res.render("guest/roomBooking", {rooms:results});
        }
    });
});

router.post('/guest/roomBooking', function(req, res){
    const reqBody = new URLSearchParams(req.body).toString();
    res.redirect('/guest/roomBooking/?' + reqBody);
});

module.exports = router;