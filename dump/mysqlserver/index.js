var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
app.set("view engine","ejs");
app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({
    extended: true,
}));



var mysql = require('mysql');

var con = mysql.createConnection({
  host: "127.0.0.1",
  port: "3306",
  user: "root",
  password: "",
  database: "sayas"
});

con.connect(function(err) {
    if (err) { console.log("Couldn't connect, restart server")
                console.log(err);
    }
    else
        console.log("Connected!");
});


app.get("/", function(req, res){
    res.render("main");
});
app.get("/student", function(req, res){
    res.render("student");
});
app.get("/parent", function(req, res){
    res.render("parent");
});
app.get("/parsignup", function(req, res){
    res.render("parsignup");
});
app.get("/stusignup", function(req, res){
    res.render("stusignup");
});


app.post("/stusub", function(req, res){
    var sname,sic,sph,semail,spass;
    sname = req.body.sname; 
    sic = req.body.sic; 
    sph = req.body.sph; 
    semail = req.body.semail; 
    spass = req.body.spass; 
    var sql = "INSERT INTO student (s_sic,s_name,s_phone_no,s_email,s_password) VALUES ('"+String(sic)+"','"+String(sname)+"','"+String(sph)+"','"+String(semail)+"','"+String(spass)+"')";
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });

    res.redirect("/student");
    
});

app.post("/parsub", function(req, res){
    var pname,pusern,pph,pemail,ppass;
    pname = req.body.pname; 
    pusern = req.body.pusern; 
    pph = req.body.pph; 
    pemail = req.body.pemail; 
    ppass = req.body.ppass; 
    var sql = "INSERT INTO parent (p_uid,p_name,p_phone_no,p_email,p_password) VALUES ('"+String(pusern)+"','"+String(pname)+"','"+String(pph)+"','"+String(pemail)+"','"+String(ppass)+"')";
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });

    res.redirect("/parent");
    
});
app.get("/entry", function(req, res){
       res.render("coordinate");
});

app.post("/coordinates", function(req, res){
        var lat = req.body.lat;
        var long = req.body.long;
        var busno = req.body.no;
        console.log(lat+"\n"+long+"\n"+busno+"\n");
        var sql = "INSERT INTO location (bus_no,time_stamp,longitude,latitude) VALUES ('"+String(busno)+"',NOW(),'"+String(long)+"','"+String(lat)+"')";
        
        con.query(sql, function (err, result) {
            if (err) { console.log(err.code) };
            console.log("1 record inserted");
        });
        res.redirect("/entry");
});
app.get("/show/:busno", function(req, res){
    var busno = req.params.busno;
    console.log(busno);
    console.log(process.env.IP);
    console.log(process.env.PORT);
    var sql = "SELECT * FROM location where bus_no='"+busno+"'";
    con.query(sql, function (err, result, fields) {
        if (err) { console.log(err.code) };
        console.log(result);
        console.log(result[0].bus_no);
        res.setHeader('content-type', 'text/JSON');
        res.send(JSON.stringify(result));
    });
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log(process.env.IP);
    console.log("Server Running");
});