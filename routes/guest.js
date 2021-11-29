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

function generateRoomBookingInvoice(params) {
    mysqlConnection.query('SELECT GetID("Bill") as InvoiceNumber;', function(err,result){
        if(err || result.length===0) {
            console.log(err);
        } else {
            params.InvoiceNumber = result[0].InvoiceNumber;
            params.InvoiceDate = new Date().toISOString().slice(0, 10);
            params.Quantity = 1;
            mysqlConnection.query(mysqlQueriesGuest.selectRoomFromRoomBookingID(params), function(err,result){
                if(err) {
                    console.log(err);
                } else {
                    params.Cost = result[0].Cost;
                    params.Product = result[0].Occupancy + ' room';
                    if(result[0].HasBathroom === "Yes") {
                        params.Product = params.Product + ' With Bathroom';
                    }
                    mysqlConnection.query(mysqlQueriesGuest.insertBill(params), function(err,result){
                        if(err) {
                            console.log(err);
                        } else {
                            mysqlConnection.query(mysqlQueriesGuest.insertUser_Bill(params), function(err,result){
                                if(err) {
                                    console.log(err);
                                } else {
                                    mysqlConnection.query(mysqlQueriesGuest.insertRoomBooking_Bill(params), function(err,result){
                                        if(err) {
                                            console.log(err);
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
}

router.get('/guest/booking/room/:status/:bookingId', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.updateRoomBookingStatus(req.params), function(err,results){
        if(err) {
            req.flash('error', 'Something Went Wrong!');
        } else {
            req.params.CollegeID = req.user.CollegeID;
            req.params.BookingID = req.params.bookingId;
            generateRoomBookingInvoice(req.params);
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

function generateFoodBookingInvoice(params) {
    mysqlConnection.query('SELECT GetID("Bill") as InvoiceNumber;', function(err,result){
        if(err || result.length===0) {
            console.log(err);
        } else {
            params.InvoiceNumber = result[0].InvoiceNumber;
            params.InvoiceDate = new Date().toISOString().slice(0, 10);
            mysqlConnection.query(mysqlQueriesGuest.selectFoodOrder(params), function(err,result){
                if(err) {
                    console.log(err);
                } else {
                    params.Cost = result[0].Cost;
                    params.Product = result[0].Type + ' On ' + result[0].OrderDate.toISOString().slice(0, 10);
                    mysqlConnection.query(mysqlQueriesGuest.insertBill(params), function(err,result){
                        if(err) {
                            console.log(err);
                        } else {
                            mysqlConnection.query(mysqlQueriesGuest.insertUser_Bill(params), function(err,result){
                                if(err){
                                    console.log(err);
                                } else {
                                    mysqlConnection.query(mysqlQueriesGuest.insertFoodBooking_Bill(params), function(err,result){
                                        if(err) {
                                            console.log(err);
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
}

router.get('/guest/booking/food/:status/:bookingId', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.updateFoodBookingStatus(req.params), function(err,results){
        if(err) {
            req.flash('error', 'Something Went Wrong!');
            res.redirect('/guest/bookings/food');
        } else if(req.params.status === "Approved") {
            req.params.CollegeID = req.user.CollegeID;
            req.params.OrdersID = req.query.OrdersID;
            req.params.Quantity = req.query.Quantity;
            req.params.BookingID = req.params.bookingId;
            generateFoodBookingInvoice(req.params);
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

//===================================================
//              Expenditures
//===================================================

router.get('/guest/expenditures', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.selectExpenditure(), function(err,result){
        if(err) {
            console.log(err);
            req.flash('error', 'Something Went Wrong!');
            res.redirect('back');
        } else {
            let totalExpenditure = 0;
            result.forEach(function(obj){
                totalExpenditure = totalExpenditure + obj.Amount;
            });
            res.render('guest/expenditures', {expenditures:result, totalExpenditure:totalExpenditure});
        }
    })
});

router.get('/guest/expenditures/new', middlewareObj.isAdmin, function(req,res){
    res.render('guest/newExpenditure');
});

router.post('/guest/expenditures/new', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query('SELECT GetID("Expenditure") as ExpenditureID;', function(err,result){
        if(err) {
            console.log(err);
            req.flash('error', 'Something Went Wrong!');
            res.redirect('back');
        } else {
            req.body.ExpenditureID = result[0].ExpenditureID;
            mysqlConnection.query(mysqlQueriesGuest.insertExpenditure(req.body), function(err,result){
                if(err) {
                    console.log(err);
                    req.flash('error', 'Something Went Wrong!');
                    res.redirect('back');
                } else {
                    req.flash('success', 'Expenditure Added Successfully!');
                    res.redirect('/guest');
                }
            });
        }
    })
});

//===================================================
//              Monthly Bookings
//===================================================

router.get('/guest/monthlyBookings/room', middlewareObj.isLoggedIn, function(req,res){
    if(!req.query.monthAndYear) {
        res.render('guest/monthlyRoomBooking', {bookings:[], monthAndYear: false});
    } else {
        const d=new Date(req.query.monthAndYear);
        req.query.Month = d.getMonth()+1;
        req.query.Year = d.getFullYear();
        mysqlConnection.query(mysqlQueriesGuest.getMonthlyRoomBookings(req.query), function(err,result){
            if(err) {
                req.flash('error', 'Something Went Wrong!');
                console.log(err);
                res.redirect('back');
            } else {
                let totalBookingAmount = 0;
                result.forEach(function(obj){
                    totalBookingAmount = totalBookingAmount + obj.Cost;
                });
                res.render('guest/monthlyRoomBooking', {bookings:result, monthAndYear:req.query.monthAndYear, totalBookingAmount:totalBookingAmount});
            }
        });
    }
});

router.post('/guest/monthlyBookings/room', middlewareObj.isLoggedIn, function(req,res){
    const reqBody = new URLSearchParams(req.body).toString();
    res.redirect('/guest/monthlyBookings/room?' + reqBody);
});

router.get('/guest/monthlyBookings/food', middlewareObj.isLoggedIn, function(req,res){
    if(!req.query.monthAndYear) {
        res.render('guest/monthlyFoodBooking', {bookings:[], monthAndYear: false});
    } else {
        const d=new Date(req.query.monthAndYear);
        req.query.Month = d.getMonth()+1;
        req.query.Year = d.getFullYear();
        mysqlConnection.query(mysqlQueriesGuest.getMonthlyFoodBookings(req.query), function(err,result){
            if(err) {
                req.flash('error', 'Something Went Wrong!');
                console.log(err);
                res.redirect('back');
            } else {
                let totalBookingAmount = 0;
                result.forEach(function(obj){
                    totalBookingAmount = totalBookingAmount + obj.Cost*obj.Quantity;
                });
                res.render('guest/monthlyFoodBooking', {bookings:result, monthAndYear:req.query.monthAndYear, totalBookingAmount:totalBookingAmount});
            }
        });
    }
});

router.post('/guest/monthlyBookings/food', middlewareObj.isLoggedIn, function(req,res){
    const reqBody = new URLSearchParams(req.body).toString();
    res.redirect('/guest/monthlyBookings/food?' + reqBody);
});

//===================================================
//              Staff Duty Scheduler
//===================================================

router.get('/guest/dutyRoster',function(req,res){
    if(!req.query.Day || !req.query.TimeSlot) {
        res.render('guest/dutyRoster', {Day:false, TimeSlot:false, staffs:[]});
    } else {
        mysqlConnection.query(mysqlQueriesGuest.selectScheduledStaff(req.query), function(err,result){
            if(err) {
                console.log(err);
                req.flash('Something Went Wrong!');
                res.redirect('/guest');
            } else {
                res.render('guest/dutyRoster', {Day:req.query.Day, TimeSlot:req.query.TimeSlot, staffs:result});
            }
        })
    }
});

router.post('/guest/dutyRoster', function(req,res){
    const reqBody = new URLSearchParams(req.body).toString();
    res.redirect('/guest/dutyRoster?' + reqBody);
});

router.get('/guest/leaveRequests/new', middlewareObj.isStaff, function(req,res){
    res.render('guest/newLeaveRequest');
});

router.post('/guest/leaveRequests', middlewareObj.canSubmitLeaveRequests, function(req,res){
    mysqlConnection.query('SELECT GetID("LeaveRequests") as RequestID;', function(err,result){
        if(err) {
            console.log(err);
            req.flash('error', 'Something Went Wrong!');
            res.redirect('/guest/leaveRequests/new');
        } else {
            req.body.RequestID = result[0].RequestID;
            req.body.DutyID = req.body.Day;
            if(req.body.TimeSlot === 'Evening')req.body.DutyID = Number(req.body.DutyID) + 7;
            req.body.RequestTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            req.body.Status = 'Pending';
            mysqlConnection.query(mysqlQueriesGuest.insertNewLeaveRequest(req.body), function(err,result){
                if(err) {
                    console.log(err);
                    req.flash('error', 'Something Went Wrong! Please verify the details and try again.');
                    res.redirect('/guest/leaveRequests/new');
                } else {
                    req.flash('success', 'Leave Request Submitted Successfully!');
                    res.redirect('/guest');
                }
            });
        }
    });
});

router.get('/guest/leaveRequests', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.selectPendingLeaveRequests(), function(err,result){
        if(err) {
            console.log(err);
            res.redirect('/guest');
        } else {
            res.render('guest/leaveRequests', {requests:result});
        }
    });
});

router.get('/guest/leaveRequests/:Status/:RequestID', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.updateLeaveRequestStatus(req.params), function(err,result){
        if(err) {
            console.log(err);
        }
    });
    if(req.params.Status==="Approved") {
        mysqlConnection.query(mysqlQueriesGuest.selectAvailableStaff(req.query), function(err,result){
            if(err) {
                console.log(err);
                req.flash('error', 'Something Went Wrong!');
                res.redirect('/guest/leaveRequests');
            } else if(result.length === 0) {
                req.flash('error', 'No Replacement Found!');
                res.redirect('/guest/leaveRequests');
            } else {
                req.params.AssignedStaffID = result[0].StaffID;
                mysqlConnection.query(mysqlQueriesGuest.updateStaffReplacement(req.params), function(err,result){
                    if(err) {
                        console.log(err);
                        req.flash('error', 'Something Went Wrong!');
                        res.redirect('/guest/leaveRequests');
                    } else {
                        req.flash('success', 'Leave Request Granted and Replecement Assigned!');
                        res.redirect('/guest/leaveRequests');
                    }
                });
            }
        });
    } else {
        req.flash('error', 'Request Rejected!');
        res.redirect('/guest/leaveRequests');
    }
});

module.exports = router;