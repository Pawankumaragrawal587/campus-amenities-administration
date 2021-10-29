require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysqlConnection = require('./mysqlQueries/mysqlConnection.js');
const mysqlQueriesGuest = require('./mysqlQueries/guest.js');
const mysqlQueriesLandscape = require('./mysqlQueries/landscape.js');
const mysqlQueriesMarket = require('./mysqlQueries/market.js');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const middlewareObj = require('./middleware/index.js');

//=================================================
//              Express Configuration
//=================================================

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended:true
}));

//=================================================
//       Passport and Session Configuration
//=================================================

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
        usernameField: 'webmail',
        passwordField: 'password'
    },
    function(username, password, done) {
        mysqlConnection.query(mysqlQueriesGuest.selectUser(username), function(err,result){
            if(err) {
                return done(err);
            } else if(result.length===0) {
                return done(null, false, { message: 'Incorrect username.' });
            } else if(password===result[0].Password) {
                return done(null, result[0]);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.Webmail);
});

passport.deserializeUser(function(webmail, done) {
    mysqlConnection.query(mysqlQueriesGuest.selectUser(webmail), function(err,result){
        done(err,result[0]);
    });
});

// user can be used on every ejs template
app.use(function(req,res,next){
    res.locals.user = req.user;
    return next();
});

//=================================================
//            MySql Database Configuration
//=================================================

mysqlConnection.connect(function(err){
    if(err) {
        console.log(err);
    } else {
        console.log("Database Connected Successfully");
        mysqlQueriesGuest.configDB();
        mysqlQueriesLandscape.configDB();
        mysqlQueriesMarket.configDB();
    }
});

// ================================================
//                      ROUTES
// ================================================

const guestRoute = require('./routes/guest.js');
const landscapeRoute = require('./routes/landscape.js');
const marketRoute = require('./routes/market.js');

app.use(guestRoute);
app.use(landscapeRoute);
app.use(marketRoute);

app.get("/",function(req,res){
    res.render("home");
});

app.get('/login', middlewareObj.isLoggedOut, function(req, res){
    res.render('login');
});

app.post('/login',
    middlewareObj.isLoggedOut,
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/login'
    })
);

app.get('/logout', function(req,res){
    req.logOut();
    res.redirect('/');
});

// Default Route
app.get('*',function(req,res){
    res.render("error");
});

// Starting the server
app.listen(process.env.PORT,function(){
    console.log("Server is running on port", process.env.PORT);
});
