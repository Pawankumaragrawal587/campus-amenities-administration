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

middlewareObj.isStaff = function(req,res,next) {
    if(req.isAuthenticated()){
        if(req.user.UserType === "Staff") {
            return next();
        } else {
            req.flash('error','Permission denied!');
            res.redirect('back');
        }
    } else {
        req.flash('error','Please Login first!');
        res.redirect('/login');
    }
}

middlewareObj.isShopKeeper = function(req,res,next) {
    if(req.isAuthenticated()){
        if(req.user.UserType === "ShopKeeper") {
            return next();
        } else {
            req.flash('error','Permission denied!');
            res.redirect('back');
        }
    } else {
        req.flash('error','Please Login first!');
        res.redirect('/login');
    }
}

middlewareObj.canSubmitLeaveRequests = function(req,res,next) {
    if(req.isAuthenticated()){
        if(req.user.UserType === "Staff" && req.body.StaffID == req.user.CollegeID.substring(3,req.user.CollegeID.length)) {
            return next();
        } else {
            req.flash('error','Permission denied!');
            res.redirect('back');
        }
    } else {
        req.flash('error','Please Login first!');
        res.redirect('/login');
    }
}

middlewareObj.isGardener = function(req,res,next) {
    if(req.isAuthenticated()){
        if(req.user.UserType === "Gardener") {
            return next();
        } else {
            req.flash('error','Permission denied!');
            res.redirect('back');
        }
    } else {
        req.flash('error','Please Login first!');
        res.redirect('/login');
    }
}

middlewareObj.canSubmitGardenerLeaveRequests = function(req,res,next) {
    if(req.isAuthenticated()){
        if(req.user.UserType === "Gardener" && req.body.GID == req.user.CollegeID) {
            return next();
        } else {
            console.log(req.body.GID);
            console.log(req.user.CollegeID);
            req.flash('error','Permission denied!');
            res.redirect('back');
        }
    } else {
        req.flash('error','Please Login first!');
        res.redirect('/login');
    }
}

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
