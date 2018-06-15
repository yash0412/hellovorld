var express = require("express");


var app = express();
app.set("view engine","ejs");
app.use(express.static(__dirname + '/views'));




app.get("/", function(req, res){
   res.render("index");
});

app.listen(8081, "0.0.0.0", function(){
    console.log("listening to port 8081");
    console.log("Server Running");
});