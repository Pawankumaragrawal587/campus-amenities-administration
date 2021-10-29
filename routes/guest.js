const express = require('express');
const router = express.Router();
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');
const mysqlQueriesGuest = require('../mysqlQueries/guest.js');
const middlewareObj = require('../middleware/index.js');

router.get('/guest', function(req, res){
    res.render("guest/index");
});

router.get('/guest/roomAvailability', middlewareObj.isLoggedIn, function(req, res){
    rooms = [];
    if(!req.query.stayFrom) {
        res.render("guest/roomAvailability", {rooms:rooms, stayFrom: false, stayTill:false});
    } else {
        req.query.occupancy = 'Single';
        req.query.hasBathroom = 'No';
        mysqlConnection.query(mysqlQueriesGuest.roomAvailabilityQuery(req.query), function(err, results){
            if(err) {
                console.log(err);
                res.redirect('/guest/roomAvailability');
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
                        res.redirect('/guest/roomAvailability');
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
                                res.redirect('/guest/roomAvailability');
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
                                        res.redirect('/guest/roomAvailability');
                                    } else {
                                        if(results.length>0) {
                                            results[0].num = results.length;
                                            rooms.push(results[0]);
                                        }
                                        res.render("guest/roomAvailability", {rooms:rooms, stayFrom:req.query.stayFrom, stayTill:req.query.stayTill});
                                    }
                                });
                            }
                        })
                    }
                });
            }
        });
    }
});

router.post('/guest/roomAvailability', function(req, res){
    const reqBody = new URLSearchParams(req.body).toString();
    res.redirect('/guest/roomAvailability/?' + reqBody);
});

router.get('/guest/roomBooking', middlewareObj.isLoggedIn, function(req,res){
    res.render('guest/roomBooking',{bookingData:req.query});
});

module.exports = router;