var express = require("express");
var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var config = require("./config");
bodyParser = require("body-parser");
var app = express();
var googleProfile = {};
app.use(bodyParser.json());

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: config.CALLBACK_URL
        },
        function(accessToken, refreshToken, profile, cb) {
            googleProfile = {
                id: profile.id,
                displayName: profile.displayName
            };
            cb(null, profile);
        }
    )
);

app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.static("css"));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/logged", function(req, res) {
    res.render("logged", { user: googleProfile });
});

app.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);
app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        successRedirect: "/logged",
        failureRedirect: "/"
    })
);

app.listen(3000);

app.use(function(req, res, next) {
    res.status(404).send("Sorry, we could not find what you want!");
});
