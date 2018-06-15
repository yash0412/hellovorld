var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var session = require("express-session");

var app = express();

app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");

app.use(express.static(__dirname + '/views')); // addding views as the default folder for response pages
app.use(bodyParser.urlencoded({ //accepts url encoded data
    extended: true
})); // setting body

app.use(session({secret: 'ssshhhhh',
    resave: true,
    saveUninitialized: true}));

var con = mysql.createConnection({//setting up mysql
    host: process.env.DATABASE_URL,
    port: "3306",
    user: "root",
    database: "website"
});


var sess;



con.connect(function(err) {//connecting to mysql server
    if (err){ 
        console.log("Error!! Restart Server");console.log(err);
        throw err;}
    else
      console.log("Connected!");
});

app.get("/", function(req, res){
    sess = req.session;
    if(sess.email){
        res.redirect("/home");
    } else{
        res.render("front");
    }
});

app.get('/logout',function(req,res){
    req.session.destroy(function(err) {
        if(err) {
            console.log(err);
            throw err;
        } else {
            res.redirect('/');
        }
    });
});

app.get("/register", function(req, res){
    sess = req.session;
    if(sess.email){
        res.redirect("/home");
    } else{
        res.render("register");
    }
});



app.get("/delcart", function(req, res){
    sess=req.session;
    if(sess.email){
        var id = req.query.id;
        var sql = "Delete from cart where email ='"+sess.email+"' and product_id = '"+id+"';";
        con.query(sql, function (err, ads) {
            if(err) {
                throw err;
            } else {
                res.redirect("/mycart");
            }
        });
    } else {
        res.redirect("/");
    }
});
app.get("/product", function(req, res){
    sess = req.session;
    if(sess.email){
        var id = req.query.id;
        var sql = "select * from products where product_id='"+id+"';";
        con.query(sql, function(err, result){
            if(err)
                throw err;
            else{
                var data = {user: sess.name, ads: result};
                res.render("ads", {data: data});
            }
        });
    } else {
        res.redirect("/");
    }
});
app.get("/mycart", function(req, res){
    sess = req.session;
    if(sess.email){
        var sql = "select * from (select * from cart where email ='"+sess.email+"') as D INNER JOIN products ON D.product_id = products.product_id;";
        con.query(sql, function(err, result){
            if(err)
                throw err;
            else {
                var data = {user: sess.name, ads: result};
                res.render("ads", {data: data});
            }
        });
    } else {
        res.redirect("/");
    }
});

app.get("/addcart", function(req, res){
    sess = req.session;
    if(sess.email){
        var id = req.query.id;
        var sql = "select * from cart where email ='"+sess.email+"' and product_id='"+id+"';";
        con.query(sql, function(err, result){
            if(err)
                throw err;
            else {
                if(result.length == 0){
                    sql = "insert into cart values ('"+id+"','"+sess.email+"');";
                    con.query(sql, function(err, add){
                        if(err){
                            throw err;
                        } else {
                            res.redirect("/home");
                        }
                    })
                }
            }
        });
    } else {
        res.redirect("/");
    }
});

app.get("/home", function(req, res){
    var category = req.query.category;
    var sort = req.query.sort;
    sess = req.session;
    if(sess.email){
        var sql = "Select * from users where email = '"+sess.email+"'";
        con.query(sql, function (err, result) {
            if(err) {
                throw err;
            } else {
                if(!category && !sort)
                    var sql = "Select * from products";
                else if(!category){
                    if(sort == "low")
                        sql = "Select * from products order by price";
                    else if(sort == "high")
                        sql = "Select * from products order by price desc";
                }
                else if(!sort){
                    sql = "Select * from products where category = '"+category+"'";
                }
                else {
                    if(sort == "low")
                        sql = "Select * from products where category = '"+category+"'order by price";
                    else if(sort == "high")
                        sql = "Select * from products where category = '"+category+"'order by price desc";
                }
                con.query(sql, function (err, ads) {
                    if(err) {
                        throw err;
                    } else {
                        sql = "select * from cart where email = '"+sess.email+"'";
                        con.query(sql, function(err, cart){
                            if(err){
                                throw err;
                            } else {
                                var data = {user: result[0], ads: ads, cart: cart};
                                var match = data.cart.filter(function( obj ) {
                                    return obj.product_id == ads[0].product_id;
                                });
                                res.render("first", {data: data});
                            }
                        });
                    }
                });
            }
        });   
    } else {
        res.redirect("/");
    }
});

app.get("/add", function(req, res){
    res.render("add");
});

app.get("/*", function(req, res){
    res.send("404<a href='/'>Go back</a>");
});


app.post("/register", function(req, res){
    sess = req.session;
    var user = req.body.user;
    var sql = "insert into users values('"+user.first+"','"+user.last+"','"+user.mail+"','"+user.pass+"','NA');";
    con.query(sql, function (err, result) {
        if(err) {
            throw err;
        } else {
            sess.email = user.mail;
            sess.name = user.first+" "+user.last;
            res.redirect("/home");
        }
    });
});

app.post("/login", function(req, res){
    sess = req.session;
    var user = req.body.user;
    var sql = "Select * from users where email = '"+user.mail+"' and passwd = '"+user.pass+"'";
    con.query(sql, function (err, result) {
        if(err) {
            throw err;
        } else {
            if(result.length == 0){
                res.send("Invalid Credentials <a href='/'>Go back</a>");
            } else {
                sess.email = user.mail;
                sess.name = result[0].first_name+" "+result[0].last_name;
                res.redirect("/home");
            }
        }
    });
});


app.post("/add", function(req, res){
    var name = req.body.name;
    var category = req.body.category;
    var subcat = req.body.subcategory;
    var image = req.body.image;
    var desc = req.body.desc;
    var price = req.body.price;
    var sql = "insert into products values('"+name+"','"+desc+"','"+category+"','"+subcat+"','"+price+"','"+image+"',UUID());";
    
    con.query(sql, function(err, ads) {
        if(err)
            throw err;
        else{
            res.redirect("/add");
        }
    });
});

app.listen(process.env.PORT, process.env.BIND_IP, function(){
    console.log("listening to port "+process.env.PORT);
    console.log("Server Running");
});