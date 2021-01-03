//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser"); 
const _ = require('lodash');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
  }));
app.use(passport.initialize());
app.use(passport.session());
 
 
mongoose.connect(process.env.DB_URI,{useNewUrlParser: true, useUnifiedTopology:true,'useCreateIndex':true});

const usersSchema = new mongoose.Schema({
    username: String,
    salt: String,
    password: String 
  });   

usersSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", usersSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

 

app.get('/login', function(req, res) {
     res.render("login");
  });


app.post("/login", (req, res) => { 
     const user = new User({
         username: req.body.username,
         password: req.body.password
     });

     req.login(user, err => {
         if(err)
            return res.send(err);
        
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/secret");
            }); 
     })
});

app.get("/register", (req, res) => {
    res.render("register");
}); 

app.get("/secret", (req, res) => {
    if(req.isAuthenticated){
        res.render("secrets");
    }else{
        res.redirect("/login");
    } 
});  

app.get("/logout", (req,res) => {
    req.logOut();
    res.redirect("/");
})

app.post("/register", (req, res) => {

     User.register({username: req.body.username}, req.body.password, (err, user) => {
         if(err)
            return res.send(err);
            //function get called if authentication sucess
         passport.authenticate("local")(req, res, ()=>{ 
             res.redirect("/secret");
         });
     })
});

app.listen(process.env.PORT||3000, function() {
    //console.log("Server started on port 3000");
  });