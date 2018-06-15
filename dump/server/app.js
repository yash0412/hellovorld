var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/sayas");

var testSchema = new mongoose.Schema({
   time: String,
   lat: String,
   long: String,
   busno: String
});

var Test = mongoose.model("Test", testSchema);

app.get("/entry", function(req, res){
       res.render("coordinate");
});

app.post("/coordinates", function(req, res){
        var time = req.body.timestamp;
        var lat = req.body.lat;
        var long = req.body.long;
        var busno = req.body.no;
        console.log(time+"\n"+lat+"\n"+long+"\n"+busno+"\n");
        Test.create({
            time: time,
            lat: lat,
            long: long,
            busno: busno
            
        }, function(err, test){
            if(err){
                console.log(err);
            } else {
                console.log(test);
            }
        });
        
        res.redirect("/show");
});
app.get("/show", function(req, res){
    Test.find({}, function(err, tests){
    if(err){
        console.log("OH NO, ERROR!");
        console.log(err);
    } else {
        
        res.render("showDB",{bus: tests});
    }
});
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Running");
});