var admin         =     require('firebase-admin');
var express       =     require("express");
var mysql         =     require("mysql");

var app = express();

var serviceAccount = require('./sayas-800af-firebase-adminsdk-qeeg1-4653095306.json');



var con = mysql.createConnection({
  host: "127.0.0.1",
  port: "3306",
  user: "root",
  password: "",
  database: "sayas"
});


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sayas-800af.firebaseio.com'
});

// Get a database reference to buses
const db = admin.database();

con.connect(function(err) {//connecting to mysql server
    if (err){ 
        console.log("Error!! Restart Server");console.log(err);throw err;
        }
    else
      console.log("Connected!");
});


const ref = db.ref('/student');
const ref2 = db.ref('/bus');
var changedVal, busVal;

ref.on("value", function(snapshot) {
  changedVal = snapshot.val();
//   console.log(changedVal);
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

ref2.on("value", function(snapshot) {
  busVal = snapshot.val();
//   console.log(busVal);
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

app.get("/coordinates", function(req, res){
    var lat = parseFloat(req.query.latitude);
    var long = parseFloat(req.query.longitude);
    var busno = req.query.bus_no;
    const ref = db.ref('bus/'+busno+"/location");
    ref.update({
        latitude:lat,
        longitude:long
    });
    
    var sql = "select Date(date) as date,busno,latitude,longitude,distance from lastloc where busno = "+busno+" and Date(date)=Date(NOW());";
    con.query(sql, function(err, result){
        if(err){
            console.log("Error");
            res.send("Error");
            throw err;
        } else {
            if(result.length == 0){
                var sql = "insert into lastloc (busno,latitude,longitude) values ("+busno+",'"+lat+"','"+long+"');";
                con.query(sql, function(err, result) {
                    if(err){
                        console.log("Error");
                        res.send("Error");
                        throw err;
                    } else {
                        console.log("First entry of the day of bus "+busno);
                    }
                });
            } else {
                var distance = getDistance(lat,long,parseFloat(result[0].latitude),parseFloat(result[0].longitude));
                distance = distance + result[0].distance;
                sql = "update lastloc set date=NOW(), latitude='"+lat+"', longitude='"+long+"', distance ="+distance+" where  busno = "+busno+" and Date(date)=Date(NOW());";               
                con.query(sql, function(err, result) {
                    if(err){
                        throw err;
                    } else {
                        console.log("updated");
                    }
                });
            }
        }
    });
    
    res.send("ok");
});

app.listen(8081, "0.0.0.0", function(){
    console.log("listening to port 8081");
    console.log("Server Running");
});

function getDistance(lat1,lon1,lat2,lon2){
    // This uses the haversine formula, which remains a good numberical computation,
    // even at small distances, unlike the Shperical Law of Cosines.
    // This method has ~0.3% error built in.
    var R = 6371e3; // metres
    var φ1 = Math.radians(lat1);
    var φ2 = Math.radians(lat2);
    var Δφ = Math.radians(lat2-lat1);
    var Δλ = Math.radians(lon2-lon1);
    
    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    var d = R * c;
    console.log(d);
    return d/1000.0;
}

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};
