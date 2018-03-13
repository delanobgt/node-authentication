'use strict';

let express = require("express"),
    expressSession = require("express-session"),
    bodyParser = require("body-parser"),
    methodOverride  = require("method-override"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user.js"),
    app = express();

mongoose.connect("mongodb://localhost/auth_node");
app.set("view engine", "ejs");
app.use(expressSession({
    secret: "lololololol",
    resave: false,
    saveUninitialized: false
}));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
//auth stuff
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/register", function(req, res) {
    res.render("register");
});
app.post("/register", function(req, res) {
    User.register(
        new User({username: req.body.username}),
        req.body.password,
        function(err, user) {
            if (err) {
                console.log(err);
                return res.render("register");
            }
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secret");
            })
        }
    )
});

app.get("/login", function(req, res) {
    res.render("login");
});
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login",
}), function(req, res) {
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/secret", isLoggedIn, function(req, res) {
    res.render("secret");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

const PORT = 3000;
app.listen(PORT, function(req, res) {
    console.log(`Listening on port ${PORT}`);
    console.log("Press CTRL+C to exit.");
});
