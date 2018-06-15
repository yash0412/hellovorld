var express = require("express");
var app = express();


app.get("/", function(req, res) {
   res.send("<h1>Hi there</h1>") ;
});

app.get("/bye", function(req, res) {
    res.send("Goodbye!!");
});

app.get("/dog", function(req, res) {
    res.send("Meow");
});

app.get("*", function(req, res) {
    res.send("Not Found");
});


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started");
});
