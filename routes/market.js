const express = require('express');
const router = express.Router();
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');
const mysqlQueriesMarket = require('../mysqlQueries/market.js');
const middlewareObj = require('../middleware/index.js');

router.get('/market',function(req,res){
    res.render("market/index");
});

router.get('/market/availableShops', function(req,res){
    mysqlConnection.query(mysqlQueriesMarket.selectAvailableShops(), function(err,result){
        if(err) {
            console.log(err);
        } else {
            res.render('market/shopRenting', {shops:result});
        }
    });
});

router.get('/market/shopBooking',function(req,res){
    res.render("market/shopBooking", {shopData:req.query});
});

router.post('/market/shopBooking', function(req,res){
    mysqlConnection.query('SELECT GetID("ShopKeeper") as ShopKeeperID;', function(err,result){
        if(err) {
            console.log(err);
            req.flash('error', "Something Went Wrong!");
            res.redirect('/market');
        } else {
            req.body.ShopKeeperID = result[0].ShopKeeperID;
            req.body.Tender_Status = "Pending";
            mysqlConnection.query(mysqlQueriesMarket.insertShopKeeper(req.body), function(err,result){
                if(err) {
                    console.log(err);
                    req.flash('error', "Something Went Wrong!");
                    res.redirect('/market');
                } else {
                    mysqlConnection.query(mysqlQueriesMarket.insertTender_Details(req.body), function(err,result){
                        if(err) {
                            console.log(err);
                            req.flash('error', "Something Went Wrong!");
                            res.redirect('/market');
                        } else {
                            req.flash('success', "Application Submitted Successfully!");
                            res.redirect('/market');
                        }
                    });
                }
            });
        }
    });
});

router.get('/market/shopRentingRequests', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesMarket.selectPendingTenderRequests(), function(err,result){
        if(err) {
            console.log(err);
            res.redirect('/market');
        } else {
            res.render('market/shopRentingRequests', {requests: result});
        }
    });
});

router.get('/market/shopRentingRequests/:Status', middlewareObj.isAdmin, function(req,res){
    req.query.Status=req.params.Status;
    req.query.License_registered = new Date().toISOString().slice(0, 10);
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    req.query.License_expiry = new Date(year + 2, month, day).toISOString().slice(0, 10);
    if(req.params.Status === "Approved") {
        mysqlConnection.query(mysqlQueriesMarket.updateLicense(req.query), function(err,result){
            if(err) {
                console.log(err);
            }
        });
        mysqlConnection.query(mysqlQueriesMarket.setShopAsOccupied(req.query), function(err,result){
            if(err) {
                console.log(err);
            }
        })
    }
    mysqlConnection.query(mysqlQueriesMarket.updateTenderStatus(req.query), function(err,result){
        if(err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.redirect('/market/ShopRentingRequests');
        }
    })
});

router.get('/market/activeShops', function(req,res){
    mysqlConnection.query(mysqlQueriesMarket.selectActiveShops(), function(err,results){
        if(err) {
            console.log(err);
            res.redirect('/market');
        } else {
            res.render('market/activeShops', {shops: results});
        }
    })
});

router.get('/market/feedbackform', middlewareObj.isLoggedIn, function(req,res){
    mysqlConnection.query(mysqlQueriesMarket.selectShopKeeper(req.query), function(err,result){
        if(err || result.length===0) {
            console.log(err);
            res.redirect('back');
        } else {
            res.render("market/feedbackform", {shopName:req.query.ShopName, shopKeeperName:result[0].ShopKeeperName, ShopID:req.query.ShopID});      
        }
    });
});

router.post('/market/feedbackform', middlewareObj.isLoggedIn, function(req,res){
    if(!req.body.ServiceQuality) {
        req.body.ServiceQuality=0.5;
    }
    req.body.ShopID = req.query.shopID;
    req.body.CollegeID = req.user.CollegeID;
    mysqlConnection.query('SELECT GetID("ShopFeedback") as FeedbackID;', function(err,result){
        if(err || result.length===0) {
            console.log(err);
            req.flash('error', 'Something Went Wrong!');
            res.redirect('/market/activeShops');
        } else {
            req.body.FeedbackID = result[0].FeedbackID;
            mysqlConnection.query(mysqlQueriesMarket.insertFeedback(req.body), function(err,result){
                if(err) {
                    console.log(err);
                    req.flash('error', 'Something Went Wrong!');
                    res.redirect('/market/activeShops');
                } else {
                    mysqlConnection.query(mysqlQueriesMarket.insertShop_Performance(req.body), function(err,result){
                        if(err) {
                            console.log(err);
                            req.flash('error', 'Something Went Wrong!');
                            res.redirect('/market/activeShops');
                        } else {
                            mysqlConnection.query(mysqlQueriesMarket.insertFeedback_user(req.body), function(err,result){
                                if(err) {
                                    console.log(err);
                                    req.flash('error', 'Something Went Wrong!');
                                    res.redirect('/market/activeShops');
                                } else {
                                    req.flash('success', 'Feedback Submitted Successfully!');
                                    res.redirect('/market/activeShops');
                                }
                            });
                        }
                    })
                }
            })
        }
    });
});

router.get('/market/shopKeeperDetails', function(req,res){
    mysqlConnection.query(mysqlQueriesMarket.selectShopKeeperinfo(), function(err,results){
      if(err){
        console.log(err);
        res.redirect('/market');
      }else{
        res.render("market/shopKeeperDetails", {shopkeeper: results});
      }
        
    })
});

router.get('/market/billPaymentform',function(req,res){
    res.render("market/billPaymentform");
});

router.post('/market/billPaymentform', function(req,res){
    req.body.Payment_Status = 'Pending';
    const d = new Date(req.body.MonthAndYear);
    req.body.Month = d.getMonth()+1;
    req.body.Year = d.getFullYear();
    mysqlConnection.query(mysqlQueriesMarket.insertPayment_Details(req.body), function(err,result){
        if(err) {
            req.flash('error', 'Something Went Wrong! Please check your details and submit again.');
            console.log(err);
            res.redirect('/market/billPaymentform');
        } else {
            req.flash('success', 'Payment Verification form submitted successfully!');
            res.redirect('/market');
        }
    });
});

router.get('/market/billPaymentRequests', middlewareObj.isAdmin, function(req,res){
    mysqlConnection.query(mysqlQueriesMarket.selectPendingPaymentVerification(), function(err,result){
        res.render('market/billPaymentRequests', {requests:result});
    });
});

router.get('/market/billPaymentRequests/:Status', middlewareObj.isAdmin, function(req,res){
    req.query.DateOfVerification = new Date().toISOString().slice(0, 10);
    req.query.Payment_Status = req.params.Status;
    mysqlConnection.query(mysqlQueriesMarket.updateDOVAndStatus(req.query), function(err,result){
        if(err) {
            console.log(err);
            req.flash('error', 'Something Went Wrong!');
            res.redirect('/market/billPaymentRequests');
        } else {
            res.redirect('/market/billPaymentRequests');
        }
    })
})

module.exports = router;
