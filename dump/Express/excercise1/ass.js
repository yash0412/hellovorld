var express = require("express");
var app = express();
var sound = {
    pig : "Oink",
    cow : "Moo",
    dog : "Woof Woof!",
    cat : "Meow",
    bird : "Chirp" };
    
app.get("/", function(req, res){
    res.send("Hi there, welcome to my assignment!");
});

app.get("/speak/:animal", function(req, res){
    res.send("The "+req.params.animal+" says '"+sound[req.params.animal]+"'");
});

app.get("/repeat/:string/:num", function(req, res){
    var str = req.params.string;
    var n = req.params.num;
    var result = " ";
    for(var i=0; i < n; i++){
        result = result + str + " ";
    }
     
    res.send(result);
});
app.get("*", function(req, res){
    res.send("Nothing found! what are you doing with your life.");
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server running on port: "+process.env.PORT);
});

