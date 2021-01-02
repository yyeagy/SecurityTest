//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser"); 
const _ = require('lodash');
const mongoose = require('mongoose');
var md5 = require("md5")

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
mongoose.connect(process.env.DB_URI,{useNewUrlParser: true, useUnifiedTopology:true});

const usersSchema = new mongoose.Schema({
    email: String,
    password: String
  });   
  
const User = mongoose.model("User", usersSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => { 
    User.findOne({email: req.body.username}, (err, result) => {
        if(err)
            return res.send(err);
      
        if(result && result.password === md5(req.body.password)){
            res.render("secrets");
        }
        else{
            res.send("log in failed");
        }
    }); 
});

app.get("/register", (req, res) => {
    res.render("register");
}); 

app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save((err, result) => {
        if(err)
           return res.send(err);
        res.render("secrets");
    });
});

app.listen(process.env.PORT||3000, function() {
    //console.log("Server started on port 3000");
  });