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
const flash = require('connect-flash');

//=================================================
//              Express Configuration
//=================================================

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(flash());

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
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
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
        // mysqlQueriesLandscape.configDB();
        // mysqlQueriesMarket.configDB();
    }
});

//=================================================
//              Invoice Configuration
//=================================================

const easyinvoice = require('easyinvoice');
const fs = require('fs');

function getInvoiceData(params, user) {
    const data = {
        "documentTitle": "RECEIPT", //Defaults to INVOICE
        "locale": "en-US", //Defaults to en-US, used for number formatting (see docs)
        "currency": "INR", //See documentation 'Locales and Currency' for more info
        "taxNotation": "vat", //or gst
        "marginTop": 25,
        "marginRight": 25,
        "marginLeft": 25,
        "marginBottom": 25,
        "logo": fs.readFileSync("./public/images/IITP_Logo.jfif", 'base64'),
        "sender": {
            "company": "IIT Patna",
            "address": "Guest House, IIT Patna",
            "zip": "801106",
            "city": "Bihta",
            "country": "India"
        },
        "client": {
               "company": user.Name,
               "address": user.Webmail,
               "zip": user.UserType,
               "city": user.CollegeID,
               "country": "Patna, India"
            //"custom1": "custom value 1",
            //"custom2": "custom value 2",
            //"custom3": "custom value 3"
        },
        "invoiceNumber": params.InvoiceNumber,
        "invoiceDate": params.InvoiceDate.toISOString().slice(0, 10).replace('T', ' '),
        "products": [
            {
                "quantity": params.Quantity,
                "description": params.Product,
                "tax": 18,
                "price": params.Cost
            }
        ],
        "bottomNotice": "Kindly pay your invoice to avoid last minute hassle. "
    };
    return data;
}

// ================================================
//                      ROUTES
// ================================================

// const guestRoute = require('./routes/guest.js');
// const landscapeRoute = require('./routes/landscape.js');
const marketRoute = require('./routes/market.js');

// app.use(guestRoute);
// app.use(landscapeRoute);
app.use(marketRoute);

app.get("/",function(req,res){
    res.render("home");
});

app.get('/user/:CollegeID', middlewareObj.isLoggedIn, function(req,res){
    mysqlConnection.query(mysqlQueriesGuest.selectRoomBookingByUser(req.user.CollegeID), function(err, result1){
        if(err) {
            console.log(err);
            res.redirect('/');
        } else {
            mysqlConnection.query(mysqlQueriesGuest.selectFoodBookingByUser(req.user.CollegeID), function(err, result2){
                if(err) {
                    console.log(err);
                    res.redirect('/');
                } else {
                    res.render('user', {roomBookings:result1, foodBookings:result2});
                }
            });
        }
    })
});

app.get('/invoice/:BookingType/:BookingID', middlewareObj.isInvoiceOwner, function(req,res){
    if(req.params.BookingType === "roomBooking") {
        mysqlConnection.query(mysqlQueriesGuest.selectBillUsingRoomBookingID(req.params), function(err,result){
            if(err || result.length === 0) {
                console.log(err);
                res.redirect('back');
            } else {
                const data = getInvoiceData(result[0], req.user);
                easyinvoice.createInvoice(data, function (result) {
                    const buf = Buffer.from(result.pdf, 'base64');
                    res.contentType("application/pdf");
                    res.send(buf);
                });
            }
        });
    } else if(req.params.BookingType === "foodBooking") {
        mysqlConnection.query(mysqlQueriesGuest.selectBillUsingFoodBookingID(req.params), function(err,result){
            if(err || result.length === 0) {
                console.log(err);
                res.redirect('back');
            } else {
                const data = getInvoiceData(result[0], req.user);
                easyinvoice.createInvoice(data, function (result) {
                    const buf = Buffer.from(result.pdf, 'base64');
                    res.contentType("application/pdf");
                    res.send(buf);
                });
            }
        });
    } else {
        res.redirect('back');
    }
});

app.get('/login', middlewareObj.isLoggedOut, function(req, res){
    res.render('login');
});

app.post('/login',
    middlewareObj.isLoggedOut,
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
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
