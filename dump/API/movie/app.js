var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/results", function(req, res){
    res.send("hello");
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Running");
});