const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended:true
}));

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

app.get('*',function(req,res){
    res.render("error");
});

app.listen(3000,function(){
    console.log("Server is running on port 3000");
});
