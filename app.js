require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require('mysql2');

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

const mysqlConnection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

mysqlConnection.connect(function(err){
    if(err) {
        console.log(err);
    } else {
        console.log("Database Connected Successfully");
        showTestEntries();
    }
});

function showTestEntries() {
    const mysqlQuery = "SELECT * FROM test";
    mysqlConnection.query(mysqlQuery, function(err, result){
        if(err) {
            console.log(err);
        } else {
            console.log(result);
        }
    });
}

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
