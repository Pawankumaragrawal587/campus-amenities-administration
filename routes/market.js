const express = require('express');
const router = express.Router();
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');
const mysqlQueriesMarket = require('../mysqlQueries/market.js');

router.get('/market',function(req,res){
    res.render("market/index");
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
})

router.get('market/shopKeeperDetails', function(req,res){
    res.render("market/shopKeeperDetails");
})

router.get('/market/shopRentingRequests',function(req,res){
    res.render("market/shopRentingRequests");
});

router.get('/market/billPaymentform',function(req,res){
    res.render("market/billPaymentform");
});

router.get('/market/billPaymentRequests',function(req,res){
    res.render("market/billPaymentRequests");
});

router.get('/market/feedbackform',function(req,res){
    res.render("market/feedbackform");
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

module.exports = router;
