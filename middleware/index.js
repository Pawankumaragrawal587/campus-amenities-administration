const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');
const mysqlQueriesGuest = require('../mysqlQueries/guest.js');

var middlewareObj = {};

middlewareObj.isLoggedOut = function(req,res,next){
    if(!req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You are Already Signed in!');
    res.redirect('back');
};

middlewareObj.isLoggedIn = function (req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'Sign in to access the requested content!');
    res.redirect('/login');
};

middlewareObj.isAdmin = function(req,res,next){
    if(req.isAuthenticated()){
        if(req.user.UserType === "Admin") {
            return next();
        } else {
            req.flash('error','Permission denied!');
            res.redirect('back');
        }
    } else {
        req.flash('error','Please Login first!');
        res.redirect('/login');
    }
};

middlewareObj.isInvoiceOwner = function(req,res,next) {
    if(req.isAuthenticated()) {
        req.params.CollegeID = req.user.CollegeID;
        if(req.params.BookingType === "roomBooking") {
            mysqlConnection.query(mysqlQueriesGuest.selectUser_Booking(req.params), function(err,result){
                if(err || result.length === 0) {
                    req.flash('error','Permission denied!');
                    res.redirect('back');
                } else {
                    return next();
                }
            });
        } else if(req.params.BookingType === "foodBooking") {
            mysqlConnection.query(mysqlQueriesGuest.selectUser_FoodBooking(req.params), function(err,result){
                if(err || result.length === 0) {
                    req.flash('error','Permission denied!');
                    res.redirect('back');
                } else {
                    return next();
                }
            });
        } else {
            res.redirect('back');
        }
    } else {
        req.flash('error','Please Login first!');
        res.redirect('/login');
    }
}

module.exports = middlewareObj;
