var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");

router.get("/campgrounds", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err) {
            console.log(err);
        } else {
            res.render("campgrounds/index",{campgrounds : allCampgrounds});
        }
    });
});


router.get("/campgrounds/new", function(req, res){
   res.render("campgrounds/new");
});

router.post("/campgrounds", function(req, res){
    var name = req.body.name;
    var url = req.body.url;
    var description = req.body.desc;
    var newCampground = {name: name, image: url, description: description};
    Campground.create(newCampground, function(err, newlyAdded){
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

router.get("/campgrounds/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
        if(err){
            console.log(err);
        }
        else{
            res.render("campgrounds/show", {campground: campground});
        }
    });
});


module.exports = router;