const express = require('express');
const router = express.Router();
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');
const mysqlQueriesGuest = require('../mysqlQueries/guest.js');
const middlewareObj = require('../middleware/index.js');

router.get('/guest', function(req, res){
    res.render("guest/index");
});

//===================================================
//              Guest Room Booking Routes
//===================================================

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

router.post('/guest/roomBooking', middlewareObj.isLoggedIn, function(req,res){
    mysqlConnection.query('SELECT GetID("Booking") as BookingID', function(err, result){
        if(err) {
            console.log(err);
            res.redirect('/guest/roomAvailability');
        } else {
            req.body.bookingID = result[0].BookingID;
            req.body.status = 'Pending';
            req.body.bookingTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            mysqlConnection.query(mysqlQueriesGuest.insertBooking(req.body), function(err,result){
                if(err) {
                    console.log(err);
                    res.redirect('/guest/roomAvailability');
                } else {
                    mysqlConnection.query(mysqlQueriesGuest.insertGuest(req.body), function(err, result){
                        if(err) {
                            console.log(err);
                            res.redirect('/guest/roomAvailability');
                        } else {
                            mysqlConnection.query(mysqlQueriesGuest.roomAvailabilityQuery(req.body), function(err, result){
                                if(err || result.length === 0) {
                                    console.log(err);
                                    res.redirect('/guest/roomAvailability');
                                } else {
                                    req.body.roomNumber = result[0].RoomNumber;
                                    const mysqlQuery = 
                                        `
                                            CALL InsertBookingRelations("${req.user.CollegeID}", "${req.body.roomNumber}", "${req.body.aadharNumber}", ${req.body.bookingID});
                                        `
                                    mysqlConnection.query(mysqlQuery, function(err,results){
                                        if(err) {
                                            console.log(err);
                                            res.redirect('/guest/roomAvailability');
                                        } else {
                                            req.flash('success', 'Room Booking Request Submitted Successfully. You Will receive a confirmation email upon approval.');
                                            res.redirect('/guest');
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

router.get('/guest/bookings/room', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.pendingBookings(req.query), function(err,results){
        res.render('guest/roomBookingRequests', {roomBookingRequests:results});
    });
});

router.get('/guest/booking/room/:status/:bookingId', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.updateRoomBookingStatus(req.params), function(err,results){
        if(err) {
            req.flash('error', 'Something Went Wrong!');
        }
        res.redirect('/guest/bookings/room');
    });
});

//===================================================
//              Food Booking Routes
//===================================================

router.get('/guest/foodOrders', middlewareObj.isLoggedIn, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.openFoodBookings(), function(err,results){
        if(err) {
            req.flash('error', 'Something Went Wrong!');
            res.redirect('back');
        } else {
            res.render('guest/foodOrders', {foodOrders:results});
        }
    });
});

router.get('/guest/closeFoodOrder/:OrdersID', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.closeFoodBooking(req.params), function(err,results){
        if(err) {
            req.flash('error', 'Something Went Wrong!');
            res.redirect('back');
        } else {
            req.flash('success', 'Successfully Stopped taking New Orders!');
            res.redirect('/guest/foodOrders');
        }
    });
});

router.get('/guest/foodOrders/new', middlewareObj.isAdmin, function(req,res){
    res.render('guest/newFoodOrders');
});

router.post('/guest/foodOrders', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query('SELECT GetID("FoodOrders") as OrdersID;', function(err,result){
        req.body.OrdersID = result[0].OrdersID;
        req.body.BookedQuantity = 0;
        req.body.Status = 'Open';
        mysqlConnection.query(mysqlQueriesGuest.insertFoodOrders(req.body), function(err,results){
            if(err) {
                req.flash('error', 'Something Went Wrong!');
                res.redirect('back');
            } else {
                req.flash('success', 'Started Taking Orders...');
                res.redirect('/guest/foodOrders');
            }
        });
    });
});

router.get('/guest/foodBooking', middlewareObj.isLoggedIn, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.findOrderUsingOrdersID(req.query), function(err,results){
        if(err || results.length === 0) {
            req.flash('error', 'Something Went Wrong!');
            res.redirect('back');
        } else {
            res.render('guest/foodBooking', {Order: results[0]});
        }
    });
});

router.post('/guest/foodBooking', middlewareObj.isLoggedIn, function(req,res){
    mysqlConnection.query('SELECT GetID("FoodBooking") as BookingID;', function(err,results){
        if(err) {
            req.flash('error', 'Something Went Wrong!');
            res.redirect('back');
        } else {
            req.body.BookingID = results[0].BookingID;
            req.body.BookingTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            req.body.Status = 'Pending';
            req.body.CollegeID = req.user.CollegeID;
            mysqlConnection.query(mysqlQueriesGuest.insertFoodBooking(req.body), function(err,result){
                if(err) {
                    req.flash('error', 'Something Went Wrong!');
                    res.redirect('back');
                } else {
                    mysqlConnection.query(mysqlQueriesGuest.insertUser_FoodBooking(req.body), function(err, result){
                        if(err) {
                            req.flash('error', 'Something Went Wrong!');
                            res.redirect('back');
                        } else {
                            mysqlConnection.query(mysqlQueriesGuest.insertFoodOrders_FoodBooking(req.body), function(err, result){
                                if(err) {
                                    req.flash('error', 'Something Went Wrong!');
                                    res.redirect('back');
                                }else {
                                    req.flash('success', 'Food Booking Request Submitted Successfully. You Will receive a confirmation email upon approval.');
                                    res.redirect('/guest');
                                }
                            })
                        }
                    });
                }
            });
        }
    });
});

router.get('/guest/bookings/food', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.pendingFoodBookings(), function(err,results){
        res.render('guest/foodBookingRequests', {foodBookingRequests:results});
    });
});

router.get('/guest/booking/food/:status/:bookingId', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.updateFoodBookingStatus(req.params), function(err,results){
        if(err) {
            req.flash('error', 'Something Went Wrong!');
            res.redirect('/guest/bookings/food');
        } else if(req.params.status === "Approved") {
            mysqlConnection.query(mysqlQueriesGuest.updateFoodOrdersBookedQuantity(req.query), function(err,results){
                if(err) {
                    req.flash('error', 'Something Went Wrong!');
                    res.redirect('/guest/bookings/food');
                } else {
                    res.redirect('/guest/bookings/food');
                }
            });
        } else {
            res.redirect('/guest/bookings/food');
        }
    });
});

module.exports = router;