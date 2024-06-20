const express = require('express');
const path = require('path');
const app = express();


app.use(express.static(__dirname + "/"));

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "index.html"))
})

app.get("/positions", function(req, res){
    res.sendFile(path.join(__dirname, "/pages/positions.html"));
})

app.get("/updates", function(req,res){
    res.sendFile(path.join(__dirname, "/pages/updates.html"));
})

app.get("/login", function(req, res){
    res.sendFile(path.join(__dirname, "/pages/login.html"));
})

app.get("/register", function(req, res){
    res.sendFile(path.join(__dirname, "/pages/signup.html"));
})

app.get("/profile", function(req, res){
    res.sendFile(path.join(__dirname, "/pages/profile.html"));
})

app.listen(3000);