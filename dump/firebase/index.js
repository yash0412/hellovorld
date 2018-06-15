var admin         =     require('firebase-admin');
var express       =     require("express");
var bodyParser    =     require("body-parser");
var mysql         =     require("mysql");
var crypto        =     require('crypto');
var GoogleMapsAPI =     require("googlemaps");

 
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: "683dbf31",
  apiSecret: "KOfuwqLxIKMR7Qyo"
});

var app = express();

var serviceAccount = require('./sayas-800af-firebase-adminsdk-qeeg1-4653095306.json');

app.use(bodyParser.urlencoded({ //accepts url encoded data
    extended: true
})); // setting body

app.set("view engine","ejs");
app.use(express.static(__dirname + '/views'));


var con = mysql.createConnection({
  host: "127.0.0.1",
  port: "3306",
  user: "root",
  password: "",
  database: "sayas"
});


 
var publicConfig = {
  key: 'AIzaSyAqU8GlaMDefGUB6cXHuYzQUW2WImvVCVE',
  stagger_time:       1000, // for elevationPath 
  encode_polylines:   false,
  secure:             true // use https 
};

var gmAPI = new GoogleMapsAPI(publicConfig);

var geocodeParams = {
  "address":    "Acharya Vihar, Bhubaneswar",
  "components": "components=country:GB",
  "bounds":     "55,-1|54,1",
  "language":   "en",
  "region":     "uk"
};

app.get("/map", function(req, res) {
    gmAPI.geocode(geocodeParams, function(err, result){
    if(err)
        throw err;
    else
        res.send(result.results[0]);
});
});


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sayas-800af.firebaseio.com'
});

// Get a database reference to our blog
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

// ref.on("child_changed", function(snapshot) {
//   changedVal = snapshot.val();
//   console.log(changedVal);
// });

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


var getHash = ( pass , sic ) => {//email is passed insted of phone
    var hmac = crypto.createHmac('sha512', sic);
    //passing the data to be hashed
    var data = hmac.update(pass);
    //Creating the hmac in the required format
    var gen_hmac= data.digest('hex');
    //Printing the output on the console
    return gen_hmac;
};



// creating a starting path in our database
// const ref = db.ref('bus_1');
app.get("/",function(req,res){
    res.redirect("/entry");
});

app.get("/entry", function(req, res){
    res.render("coordinate");
});

app.post("/coordinates", function(req, res){
    var lat = parseFloat(req.body.latitude);
    var long = parseFloat(req.body.longitude);
    var busno = req.body.bus_no;
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


app.post("/saveBus", function(req, res) {
    
    var busno = req.body.busno;
    var source = req.body.source;
    var destination = req.body.destination;
    var waypoints = req.body.waypoints;
    console.log(waypoints);
    if(!waypoints){
        waypoints=[];}
    console.log(waypoints);
    var ref = db.ref('bus/'+busno+"/stop");
    ref.remove()
        .then(function() {
          console.log("deleted old data");
        })
        .catch(function(error) {
          console.log('Error deleting data:', error);
        });
    var geocodeParams = {
      "address":    source,
      "language":   "en",
    };
    
    gmAPI.geocode(geocodeParams, function(err, result){
        if(err)
            throw err;
        else{
            ref = db.ref('bus/'+busno+"/stop/0");
            ref.set({
                    latitude: result.results[0].geometry.location.lat,
                    longitude: result.results[0].geometry.location.lng,
                    name: source,
                    status: "NO"
            });
            geocodeParams = {
              "address":    destination,
              "language":   "en",
            };
            
            gmAPI.geocode(geocodeParams, function(err, result){
                if(err)
                    throw err;
                else{
                    ref = db.ref('bus/'+busno+"/stop/"+(waypoints.length+1));
                    ref.set({
                            latitude: result.results[0].geometry.location.lat,
                            longitude: result.results[0].geometry.location.lng,
                            name: destination,
                            status: "NO"
                    });
                    var total = waypoints.length;
                    var count = 0;
                    
                    for(var i = 0; i < total; i++){
                        (function(foo){
                            gmAPI.geocode({
                              "address":    waypoints[foo],
                              "language":   "en",
                            }, function(err, result){
                                if(err)
                                    throw err;
                                else{
                                    ref = db.ref('bus/'+busno+"/stop/"+(foo+1));
                                    ref.set({
                                            latitude: result.results[0].geometry.location.lat,
                                            longitude: result.results[0].geometry.location.lng,
                                            name: waypoints[foo],
                                            status: "NO"
                                    });
                                    count++;
                                    if (count > total - 1) done();
                                }
                            });
                        }(i));
                        
                    }
                }
            });
        }
    });
    res.send("Bus Saved");
});
function done() {
    console.log('All data has been loaded :).');
}
app.get("/stuStatus", function(req, res) {
    var rfid = req.query.rfid;
    var route = req.query.route;
    
    var registrationToken = 'YOUR_REGISTRATION_TOKEN';
    var message;
                 
    
    var sql = "select * from users where rfid = '"+rfid+"'";
    con.query(sql, function (err, result) {
        if(err) {
            throw err;
        } else {
            if(result.length == 0){
                console.log("rfid not found");
                res.send("rfid not found");
                // res.redirect("/smode");
            } else {
                const ref = db.ref("/bus/"+result[0].route+"/stop/"+result[0].stop+"/student/"+result[0].sic);
                // console.log(String(i)+". "+lat+" "+long+" "+busno+"\n");
                var status = changedVal[result[0].sic].status;
                
                var sql = "Select * from regToken where sic = '"+result[0].sic+"'";
                con.query(sql, function(err, result) {
                    if(err){
                        throw err;
                    } else {
                        if(status === "ON"){
                             
                            
                            
                            status = "OFF";
                        }
                        else{
                                
                            
                            status = "ON";
                        }
                        ref.update({
                            route: route,
                            status: status
                        });
                        if(result.length > 0){
                            for(var i=0;i<result.length;i++){
                                registrationToken = result[i].regTok;
                                
                                // Send a message in the dry run mode.
                                // var dryRun = true;
                                if(result[i].mode == "P"){
                                    if(status == "ON"){
                                        message = {
                                            notification:{
                                              title: "Student boarded the bus",
                                              body: "Your ward boarded the bus number: "+route
                                            },
                                            token: registrationToken
                                        };
                                    } else {
                                        message = {
                                            notification:{
                                              title: "Student left the bus",
                                              body: "Your ward got down from the bus number: "+route
                                            },
                                            token: registrationToken
                                        };
                                    }
                                }
                                admin.messaging().send(message)
                                  .then((response) => {
                                    // Response is a message ID string.
                                    console.log('Dry run successful:', response);
                                  })
                                  .catch((error) => {
                                    console.log('Error during dry run:', error);
                                  });
                            }
                            console.log("yes");
                            res.send("updated");
                        } else {
                            console.log("Wrong Values");
                            res.send("Wrong Values");
                        }
                    }
                });
                
            }
        }
    });
});

app.post('/sendotp', (req, res) => {
  // A user registers with a mobile phone number
  var sic = req.body.sic;
  var mode = req.body.mode;
  var phoneNumber;
  var sql = "select * from users where sic ='"+sic+"'";
  con.query(sql, function(err, result) {
      if(err || result.length == 0){
          res.send("Error occured, check SIC and try again");
          throw err;
      } else {
          if(mode == "S")
            phoneNumber = "91"+result[0].sphone;
          else
            phoneNumber = "91"+result[0].pphone;
          console.log(phoneNumber);
          nexmo.verify.request({number: phoneNumber, brand: 'sayas'}, (err,
          result) => {
            if(err) {
              res.sendStatus(500);
            } else {
              var requestId = result.request_id;
              if(result.status == '0') {
                res.send({requestId: requestId,
                            phone: phoneNumber
                        }); // Success! Now, have your user enter the PIN
              } else {
                res.status(401).send(result.error_text);
              }
            }
          });
        }
    });
});

app.post('/verify', (req, res) => {
  var pin = req.body.pin;
  var requestId = req.body.requestId;
 
  nexmo.verify.check({request_id: requestId, code: pin}, (err, result) => {
    if(err) {
        res.send("Error occured. Try again.");
      throw err;
    } else {
        console.log(result);
      if(result && result.status == '0') { // Success!
        res.send("Success");
      } else {
        res.send("Incorrect OTP entered. Try again.");
      }
    }
  });
});

app.post("/forgot", function(req, res) {
    var sic = req.body.sic;
    var pin = req.body.pin;
    var requestId = req.body.requestId;
    var password = req.body.pass;
    var mode = req.body.mode;
    var sql;
    nexmo.verify.check({request_id: requestId, code: pin}, (err, result) => {
    if(err) {
      // handle the error
    } else {
      if(result && result.status == '0') { // Success!
        if(mode == "S"){
            sql = "update users set spass = '"+password+"' where sic ='"+sic+"'";
        }
        else{
            sql = "update users set ppass = '"+password+"' where sic ='"+sic+"'";
        }
        con.query(sql, function(err, result) {
            if(err || result.affectedRows == 0){
                res.send("Error resetting password");
            } else {
                res.send("Password reset successful, login again.");
            }
        });
      } else {
        res.send("Incorrect OTP entered. Try again.");
      }
    }
    });
});


app.post("/sendtoall", function(req, res) {
    var notif = req.body.notif;
    var topic="all";
    var message;
    
    message = {
            notification:{
                  title: "Messae from Admin",
                  body: notif
                },
                topic: topic
            };
    admin.messaging().send(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Dry run successful:', response);
      })
      .catch((error) => {
        console.log('Error during dry run:', error);
      });
      res.send("sent notification");

});

app.post("/sendtobus", function(req, res) {
   var notif = req.body.notif;
   var busno = req.body.busno;
   
   var topic="bus"+busno;
    var message;
    
    message = {
            notification:{
                  title: "Messae from Admin",
                  body: notif
                },
                topic: topic
            };
    admin.messaging().send(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Dry run successful:', response);
      })
      .catch((error) => {
        console.log('Error during dry run:', error);
      });
      res.send("sent notification to bus "+busno+" students");
});

app.get("/user", function(req, res){
    res.render("signUp",{data: busVal});
});

app.post("/user", function(req, res){
    var student = req.body.stu;
    var parent = req.body.par;
    if(!parent.email){
        parent.email = "NA";
    }
    var sql = "insert into users values ('"+student.sic.toLowerCase()+
                "','NA','"+
                student.name+"','"+
                parent.name+"','"+
                student.mobile+"','"+
                parent.mobile+"','"+
                student.email+"','"+
                parent.email+"','"+
                student.route+"','"+
                getHash(student.pass,student.sic.toLowerCase())+"','"+
                getHash(parent.pass,student.sic.toLowerCase())+"',"+student.stop+");";
    con.query(sql, function (err, result) {
        if(err) {
            throw err;
        } else {
            console.log("1 record inserted");
            const ref = db.ref("/bus/"+student.route+"/stop/"+student.stop+"/student/"+student.sic);
            ref.update({
                "status": "OFF"
            });
            res.redirect("/user");
        }
    });
});

app.get("/plan", function(req, res){
    res.render("plan_routes");
});

app.get("/smode", function(req, res) {
    res.render("student");
});

app.get("/pmode", function(req, res) {
    res.render("parent");
});


app.post("/slogin", function(req, res){
    var sic = req.body.sic.toLowerCase();
    var pass = req.body.pass;
    var token = req.body.token;
    
    
    var sql = "Select * from users where sic = '"+sic+"' and spass = '"+getHash(pass,sic)+"'";
    
    con.query(sql, function (err, result) {
        if(err) {
            throw err;
        } else {
            console.log(getHash(pass,sic));
            if(result.length == 0){
                console.log("no");
                res.send("Invalid");
                // res.redirect("/smode");
            } else {
                console.log("yes");
                var sql = "insert into regToken values ('"+token+"','S','"+sic+"') ON DUPLICATE KEY UPDATE mode = 'S', sic='"+sic+"'";
                con.query(sql, function(err, result) {
                    if(err)
                        throw err;
                    else{
                        res.send("Valid");
                    }
                });
            }
        }
    });
});


app.post("/plogin", function(req, res){
    
    var sic = req.body.sic.toLowerCase();
    var pass = req.body.pass;
    
    var token = req.body.token;
    
    var sql = "Select * from users where sic = '"+sic+"' and ppass = '"+getHash(pass,sic)+"'";
    con.query(sql, function (err, result) {
        if(err) {
            throw err;
        } else {
            console.log(getHash(pass,sic));
            if(result.length == 0){
                console.log("no");
                res.send("Invalid");
                // res.redirect("/smode");
            } else {
               
                console.log("yes");
                var sql = "insert into regToken values ('"+token+"','P','"+sic+"') ON DUPLICATE KEY UPDATE mode = 'P', sic='"+sic+"'";
                con.query(sql, function(err, result) {
                    if(err)
                        throw err;
                    else{
                        res.send("Valid");
                    }
                });
            }
        }
    });
});

app.post("/getRoute", function(req, res) {
    var sic = req.body.sic;
    var sql = "select * from users where sic = '"+sic+"'";
    con.query(sql, function(err, result) {
        if(err){
            throw err;
        } else {
            if(result.length == 0){
                console.log("No results found");
                res.send("invalid sic");
            } else {
                var details = {
                    sic: result[0].sic,
                    route: result[0].route,
                    stop: result[0].stop
                };
                res.send(details);
            }
        }
    });
});

app.post("/changeRoute", function(req, res) {
   var sic = req.body.sic;
   var route = req.body.route;
   var stop = req.body.stop;
   
   var sql = "update users set route = '"+route+"', stop = '"+stop+"' where sic = '"+sic+"'";
   con.query(sql, function(err, result) {
        if(err)
            throw err;
        else{
            res.send({
               sic: sic,
               route: route,
               stop: stop
            });
        }
        
   });
});

app.get("/getBus", function(req, res) {
   var bus = req.query.busno;
   res.send(busVal[bus]);
});

app.post("/getBus", function(req, res) {
   var bus = req.body.busno;
   res.send(busVal[bus]);
});

app.post("/slogout", function(req, res) {
    var sic = req.body.sic;
    var token = req.body.token;
    
    var sql = "delete from regToken where mode= 'S' and sic = '"+sic+"' and regTok = '"+token+"'";
    
    con.query(sql, function(err, result) {
        if(err) {
            res.send("failed");
            throw err;
        }
        else
            console.log("Logged out");
            res.send("Log out");
    });
});


app.post("/plogout", function(req, res) {
    var sic = req.body.sic;
    var token = req.body.token;
    
    var sql = "delete from regToken where mode= 'P' and sic = '"+sic+"' and regTok = '"+token+"'";
    
    con.query(sql, function(err, result) {
        if(err) {
            res.send("failed");
            throw err;
        }
        else
            console.log("Logged out");
            res.send("Log out");
    });
});

app.get("/tnc", function(req, res) {
    res.render("tnc");
});
app.get("/about", function(req, res) {
    res.render("about");
});

app.get("/changeSP", function(req, res) {
    res.render("changeS");
});
app.get("/changePP", function(req, res) {
    res.render("changeP");
});
app.post("/changespass", function(req, res){
    var sic = req.body.sic;
    var opass = req.body.opass;
    var pass = req.body.pass;
    var sql = "update users set spass = '"+getHash(pass,sic.toLowerCase())+"' where sic = '"+sic+"' and spass = '"+getHash(opass,sic.toLowerCase())+"'";
    console.log(sql);
    con.query(sql, function (err, result) {
        if(err || result.affectedRows == 0) {
            res.send("Password Couldn't be changed");
        } else {
            res.send("Password Changed Sucessfull");
        }
    });   
});


app.post("/changeppass", function(req, res){
    var sic = req.body.sic;
    var opass = req.body.opass;
    var pass = req.body.pass;
    var sql = "update users set ppass = '"+getHash(pass,sic.toLowerCase())+"' where sic = '"+sic+"' and ppass = '"+getHash(opass,sic.toLowerCase())+"'";
    console.log(sql);
    con.query(sql, function (err, result) {
        if(err || result.affectedRows == 0) {
            res.send("Password Couldn't be changed");
        } else {
            res.send("Password Changed Sucessfull");
        }
    });   
});

app.post("/getstustatus", function(req, res) {
    var sic = req.body.sic;
    var status = changedVal[sic].status;
    res.send(status);
});

app.post("/getbusloc", function(req, res) {
    var busno = req.body.busno;
    res.send(busVal[busno].location);
});

app.get("/showdistance", function(req, res) {
    var date = req.query.date;
    if(!date){
        var sql = "select * from lastloc order by Date(date) desc, busno asc";
        con.query(sql, function(err, result) {
           if(err){
               throw err;
           } else {
               if(result.length == 0){
                   res.send("No bus travel data yet");
               } else {
                //   console.log(result[0]);
                   res.render("busTravel", {data: result});
               }
           }
        });
    } else {
        var sql = "select * from lastloc where Date(date) is '"+date+"' order by Date(date) desc, busno asc";
        con.query(sql, function(err, result) {
           if(err){
               throw err;
           } else {
               if(result.length == 0){
                   res.send("No bus travel data yet");
               } else {
                //   console.log(result[0]);
                   res.render("busTravel", {data: result});
               }
           }
        });
    }
});

app.get("/showStops", function(req, res) {
    var route = req.query.route;
    // console.log(busVal[route].stop);
    res.send(busVal[route].stop);
});


app.listen(8080, "0.0.0.0", function(){
    console.log("listening to port 8080");
    console.log("Server Running");
});


// function getDistance(lat1,lon1,lat2,lon2){
//     // This uses the haversine formula, which remains a good numberical computation,
//     // even at small distances, unlike the Shperical Law of Cosines.
//     // This method has ~0.3% error built in.
//     var R = 6371; // Radius of Earth in km
    
//     var dLat = Math.radians(lat2 - lat1);
//     var dLon = Math.radians(lon2 - lon1);
//     lat1 = Math.radians(lat1);
//     lat2 = Math.radians(lat2);

//     var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2);

//     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     console.log(c);
//     return c*1000;
// }

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