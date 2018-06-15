var express = require("express");
var app = express();

app.get("/", function(req, res){
    var thing = req.params.thing;
    res.render("dogs.ejs");
//   res.send("Welcome to the home page"); 
});
app.get("/fallinlovewith/:thing", function(req, res){
    var thing = req.params.thing;
    res.render("love.ejs", {thingVar: thing});
//   res.send("Welcome to the home page"); 
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Started");
});