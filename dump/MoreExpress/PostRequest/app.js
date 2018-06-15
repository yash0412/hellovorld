var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var friends = ["yash", "vishal", "ankit", "ayush"];
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.get("/", function(req, res){
    res.render("home");
});

app.get("/friends", function(req, res){
    res.render("friends", {friends: friends});
});

app.post("/addfriend", function(req, res){
    friends.push(req.body.friend);
    res.redirect("/friends");
});
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Running");
})