const express = require('express');
const router = express.Router();
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');
const mysqlQueriesGuest = require('../mysqlQueries/guest.js');

router.get('/guest',function(req, res){
    res.render("guest/index");
});

router.get('/guest/roomBooking',function(req, res){
    rooms = [];
    req.query.occupancy = 'Single';
    req.query.hasBathroom = 'No';
    mysqlConnection.query(mysqlQueriesGuest.roomAvailabilityQuery(req.query), function(err, results){
        if(err) {
            console.log(err);
            res.redirect('/guest/roomBooking');
        } else {
            if(results.length>0) {
                results[0].num = results.length;
                rooms.push(results[0]);
            }
            req.query.occupancy = 'Single';
            req.query.hasBathroom = 'Yes';
            mysqlConnection.query(mysqlQueriesGuest.roomAvailabilityQuery(req.query), function(err, results){
                if(err) {
                    console.log(err);
                    res.redirect('/guest/roomBooking');
                } else {
                    if(results.length>0) {
                        results[0].num = results.length;
                        rooms.push(results[0]);
                    }
                    req.query.occupancy = 'Double';
                    req.query.hasBathroom = 'No';
                    mysqlConnection.query(mysqlQueriesGuest.roomAvailabilityQuery(req.query), function(err, results){
                        if(err) {
                            console.log(err);
                            res.redirect('/guest/roomBooking');
                        } else {
                            if(results.length>0) {
                                results[0].num = results.length;
                                rooms.push(results[0]);
                            }
                            req.query.occupancy = 'Double';
                            req.query.hasBathroom = 'Yes';
                            mysqlConnection.query(mysqlQueriesGuest.roomAvailabilityQuery(req.query), function(err, results){
                                if(err) {
                                    console.log(err);
                                    res.redirect('/guest/roomBooking');
                                } else {
                                    if(results.length>0) {
                                        results[0].num = results.length;
                                        rooms.push(results[0]);
                                    }
                                    res.render("guest/roomBooking", {rooms:rooms});
                                }
                            });
                        }
                    })
                }
            });
        }
    });
});

router.post('/guest/roomBooking', function(req, res){
    const reqBody = new URLSearchParams(req.body).toString();
    res.redirect('/guest/roomBooking/?' + reqBody);
});

module.exports = router;