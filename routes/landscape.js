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
            req.flash('error', 'Something Went Wrong!');
            res.redirect('/landscape/grassCuttingRequest');
        } else {
            res.redirect('/landscape/grassCuttingRequest');
        }
    });
});

router.get('/landscape/MaintenanceRequest/new', middlewareObj.isLoggedIn, function(req,res){
    mysqlConnection.query(mysqlQueriesLandscape.selectEquipment(), function(err,result){
        res.render('landscape/newMaintenanceRequest', {equipments:result});
    });
});

module.exports = router;