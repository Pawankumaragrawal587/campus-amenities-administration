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

module.exports = middlewareObj;
