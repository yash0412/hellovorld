var express = require("express"),
mongoose = require("mongoose"),
bodyParser = require("body-parser"),
app = express(),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer");

mongoose.connect("mongodb://127.0.0.1/blog",function(err){
    if(err){
        console.log(err);
        throw err;
    }
});

app.set("view engine","ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type:Date,default:Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

app.get("/", function(req,res){
    res.redirect("/blogs");
});

app.get("/blogs", function(req,res){
    Blog.find(function(err,blogs){
        if(err){
            console.log(err);
        }
        else{
            res.render("index",{blogs: blogs});
        }
    });
});

app.post("/blogs", function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err) {
            res.render("new");
        }
        else {
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/new", function(req,res){
    res.render("new");
});

app.get("/blogs/:id", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } 
        else{
            res.render("show", {blog: foundBlog});
        }
    });
});

app.get("/blogs/:id/edit", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } 
        else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

app.put("/blogs/:id", function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    console.log( req.sanitize(req.body.blog.body));
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

app.delete("/blog/:id", function(req,res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs");
        }
    });
});

app.listen(8080,"0.0.0.0",function(){
    console.log("Server is Running!");
});