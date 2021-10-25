require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysqlConnection = require('./mysqlQueries/mysqlConnection.js');
const mysqlQueriesGuest = require('./mysqlQueries/guest.js');
const mysqlQueriesLandscape = require('./mysqlQueries/landscape.js');
const mysqlQueriesMarket = require('./mysqlQueries/market.js');

const app = express();

//=================================================
//              Express Configuration
//=================================================

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended:true
}));

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

// Default Route
app.get('*',function(req,res){
    res.render("error");
});

// Starting the server
app.listen(process.env.PORT,function(){
    console.log("Server is running on port", process.env.PORT);
});
