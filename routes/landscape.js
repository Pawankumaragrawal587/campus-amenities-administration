const express = require('express');
const router = express.Router();
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');
const mysqlQueriesLandscape = require('../mysqlQueries/landscape.js');
const middlewareObj = require('../middleware/index.js');

router.get('/landscape',function(req,res){
    res.render("landscape/index");
});

router.get('/landscape/grassCuttingRequest/new', middlewareObj.isLoggedIn, function(req,res){
    mysqlConnection.query(mysqlQueriesLandscape.selectCampusArea(), function(err,result){
        res.render('landscape/newGrassCuttingRequest', {areas:result});
    });
});

router.post('/landscape/grassCuttingRequest', middlewareObj.isLoggedIn, function(req,res){
    req.body.Status="Pending";
    req.body.Date = new Date().toISOString().slice(0, 10);
    req.body.CollegeID = req.user.CollegeID;
    mysqlConnection.query('SELECT GetID("GrassCuttingRequest") as GrassCuttingRequestID;', function(err,result){
        if(err) {
            req.flash('error', 'Something Went Wrong!');
            res.redirect('/landscape');
        } else {
            req.body.GrassCuttingRequestID = result[0].GrassCuttingRequestID;
            mysqlConnection.query(mysqlQueriesLandscape.insertGrassCuttingRequest(req.body), function(err,result){
                if(err) {
                    req.flash('error', 'Something Went Wrong!');
                    res.redirect('/landscape');
                } else {
                    mysqlConnection.query(mysqlQueriesLandscape.insertGrassCuttingRequest_User(req.body), function(err,result){
                        if(err) {
                            console.log(err);
                            req.flash('error', 'Something Went Wrong!');
                            res.redirect('/landscape');
                        } else {
                            req.flash('success', 'Grass Cutting Request Submitted Successfully!');
                            res.redirect('/landscape');
                        }
                    });
                }
            })
        }
    })
});

router.get('/landscape/grassCuttingRequest', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesLandscape.selectPendingGrassCuttingRequests(), function(err,result){
        if(err) {
            console.log(err);
            res.redirect('/landscape');
        } else {
            res.render('landscape/grassCuttingRequest', {requests:result});
        }
    });
});

router.get('/landscape/grassCuttingRequest/:Status/:GrassCuttingRequestID', function(req,res){
    mysqlConnection.query(mysqlQueriesLandscape.updateGrassCuttingRequestStatus(req.params), function(err,result){
        if(err) {
            console.log(err);
        }
    });
    if(req.params.Status === "Approved") {
        const currDay = new Date();
        let day = currDay.getDay();
        if(day == 7)day=1;
        req.params.DutyID = day;
        mysqlConnection.query(mysqlQueriesLandscape.selectAvailableGardener(req.params), function(err,result){
            if(err) {
                console.log(err);
                req.flash('error', 'Something Went Wrong!');
                res.redirect('/landscape/grassCuttingRequest');
            } else {
                req.params.GID = result[0].GID;
                mysqlConnection.query(mysqlQueriesLandscape.updateGIDInGrassCuttingRequest(req.params), function(err,result){
                    if(err) {
                        console.log(err);
                        req.flash('error', 'Something Went Wrong!');
                        res.redirect('/landscape/grassCuttingRequest');
                    } else {
                        req.flash('success', 'Grass Cutting Request approved and Gardener Assigned!');
                        res.redirect('/landscape/grassCuttingRequest');
                    }
                })
            }
        });
    } else {
        res.redirect('/landscape/grassCuttingRequest');
    }
});

router.get('/landscape/MaintenanceRequest/new', middlewareObj.isLoggedIn, function(req,res){
    mysqlConnection.query(mysqlQueriesLandscape.selectEquipment(), function(err,result){
        res.render('landscape/newMaintenanceRequest', {equipments:result});
    });
});

router.post('/landscape/MaintenanceRequest', middlewareObj.isLoggedIn, function(req,res){
    mysqlConnection.query('SELECT GetID("MaintenanceRequest") as MID;', function(err,result){
        if(err) {
            console.log(err);
            req.flash('error', 'Something Went Wrong! Please Try Again.');
            res.redirect('/landscape');
        } else {
            req.body.MID = result[0].MID;
            req.body.Date = new Date().toISOString().slice(0, 10);
            req.body.Status = 'Pending';
            req.body.CollegeID = req.user.CollegeID;
            mysqlConnection.query(mysqlQueriesLandscape.insertMaintenanceRequest(req.body), function(err,result){
                if(err) {
                    console.log(err);
                    req.flash('error', 'Something Went Wrong! Please Try Again.');
                    res.redirect('/landscape');
                } else {
                    mysqlConnection.query(mysqlQueriesLandscape.insertMaintenanceRequest_User(req.body),function(err,result){
                        if(err) {
                            console.log(err);
                            req.flash('error', 'Something Went Wrong! Please Try Again.');
                            res.redirect('/landscape');
                        } else {
                            req.flash('success', 'Maintenance Request Submitted Successfully!');
                            res.redirect('/landscape');
                        }
                    });
                }
            });
        }
    })
});

router.get('/landscape/MaintenanceRequest', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesLandscape.selectPendingMaintenanceRequest(),function(err,result){
        if(err) {
            console.log(err);
            req.flash('error', 'Something Went Wrong! Please Try Again.');
            res.redirect('/landscape');
        } else {
            res.render('landscape/MaintenanceRequest', {requests:result});
        }
    })
});

router.get('/landscape/MaintenanceRequest/:Status/:MID', function(req,res){
    mysqlConnection.query(mysqlQueriesLandscape.updateMaintenanceRequestStatus(req.params), function(err,result){
        if(err) {
            console.log(err);
            req.flash('error', 'Something Went Wrong! Please Try Again.');
            res.redirect('/landscape/MaintenanceRequest');
        } else {
            res.redirect('/landscape/MaintenanceRequest');
        }
    });
});

//===================================================
//              Equipment Stock
//===================================================

router.get('/landscape/equipmentstock', middlewareObj.isLoggedIn, function(req,res){
    mysqlConnection.query(mysqlQueriesLandscape.selectallEquipment(),function(err,result){
        if(err) {
            console.log(err);
            req.flash('error', 'Something Went Wrong! Please Try Again.');
            res.redirect('/landscape');
        } else {
            res.render('landscape/equipmentstock', {requests:result});
        }
    });
});





//===================================================
//              Duty Roster
//===================================================

router.get('/landscape/dutyRoster', middlewareObj.isAdmin, function(req,res){
    if(!req.query.Day) {
        res.render('landscape/dutyRoster', {Day:false, gardeners:[]});
    } else {
        mysqlConnection.query(mysqlQueriesLandscape.selectScheduledGardener(req.query), function(err,result){
            if(err) {
                console.log(err);
                req.flash('Something Went Wrong!');
                res.redirect('/landscape');
            } else {
                res.render('landscape/dutyRoster', {Day:req.query.Day, gardeners:result});
            }
        })
    }
});

router.post('/landscape/dutyRoster', middlewareObj.isAdmin, function(req,res){
    const reqBody = new URLSearchParams(req.body).toString();
    res.redirect('/landscape/dutyRoster?' + reqBody);
});

router.get('/landscape/leaveRequests/new', middlewareObj.isGardener, function(req,res){
    res.render('landscape/newLeaveRequest');
});

router.post('/landscape/leaveRequests', middlewareObj.canSubmitGardenerLeaveRequests, function(req,res){
    mysqlConnection.query('SELECT GetID("GardenerLeaveRequest") as RequestID;', function(err,result){
        if(err) {
            console.log(err);
            req.flash('error', 'Something Went Wrong!');
            res.redirect('/landscape/leaveRequests/new');
        } else {
            req.body.RequestID = result[0].RequestID;
            req.body.DutyID = req.body.Day;
            req.body.RequestTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            req.body.Status = 'Pending';
            mysqlConnection.query(mysqlQueriesLandscape.insertNewGardenerLeaveRequest(req.body), function(err,result){
                if(err) {
                    console.log(err);
                    req.flash('error', 'Something Went Wrong! Please verify the details and try again.');
                    res.redirect('/landscape/leaveRequests/new');
                } else {
                    req.flash('success', 'Leave Request Submitted Successfully!');
                    res.redirect('/landscape');
                }
            });
        }
    });
});

router.get('/landscape/leaveRequests', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesLandscape.selectPendingGardenerLeaveRequests(), function(err,result){
        if(err) {
            console.log(err);
            res.redirect('/landscape');
        } else {
            res.render('landscape/leaveRequest', {requests:result});
        }
    });
});

router.get('/landscape/leaveRequests/:Status/:RequestID', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesLandscape.updateGardenerLeaveRequestStatus(req.params), function(err,result){
        if(err) {
            console.log(err);
        }
    });
    if(req.params.Status==="Accepted") {
        mysqlConnection.query(mysqlQueriesLandscape.selectAvailableGardener(req.query), function(err,result){
            if(err) {
                console.log(err);
                req.flash('error', 'Something Went Wrong!');
                res.redirect('/landscape/leaveRequests');
            } else if(result.length === 0) {
                req.flash('error', 'No Replacement Found!');
                res.redirect('/landscape/leaveRequests');
            } else {
                req.params.AssignedGardenerID = result[0].GID;
                mysqlConnection.query(mysqlQueriesLandscape.updateGardenerReplacement(req.params), function(err,result){
                    if(err) {
                        console.log(err);
                        req.flash('error', 'Something Went Wrong!');
                        res.redirect('/landscape/leaveRequests');
                    } else {
                        req.flash('success', 'Leave Request Granted and Replacement Assigned!');
                        res.redirect('/landscape/leaveRequests');
                    }
                });
            }
        });
    } else {
        req.flash('error', 'Request Rejected!');
        res.redirect('/landscape/leaveRequests');
    }
});

//===================================================
//              Area Wise Gradener Details
//===================================================

router.get('/landscape/gardenerDetails', middlewareObj.isAdmin, function(req,res){
    if(!req.query.AID) {
        mysqlConnection.query(mysqlQueriesLandscape.selectCampusArea(), function(err,result){
            if(err) {
                console.log(err);
                req.flash('Something Went Wrong!');
                res.redirect('/landscape');
            } else {
                res.render('landscape/gardenerDetails', {AID:false, gardeners:[], areas:result});     
            }
        });
    } else {
        mysqlConnection.query(mysqlQueriesLandscape.selectCampusArea(), function(err,result1){
            if(err) {
                console.log(err);
                req.flash('Something Went Wrong!');
                res.redirect('/landscape');
            } else {
                mysqlConnection.query(mysqlQueriesLandscape.selectGardeners(req.query), function(err,result2){
                    if(err) {
                        console.log(err);
                        req.flash('Something Went Wrong!');
                        res.redirect('/landscape');
                    } else {
                        res.render('landscape/gardenerDetails', {AID:req.query.AID, areas:result1, gardeners:result2});
                    }
                });
            }
        });
    }
});

router.post('/landscape/gardenerDetails', middlewareObj.isAdmin, function(req,res){
    const reqBody = new URLSearchParams(req.body).toString();
    res.redirect('/landscape/gardenerDetails?' + reqBody);
});

module.exports = router;