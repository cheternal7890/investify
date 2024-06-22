require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const bodyParser = require("body-parser"); 
const path = require('path');
const app = express();

app.use(
    session({ secret: "cesar", saveUninitialized: true, resave: true })
  );

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handles all the routes for the application
app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "/pages/login.html"))
})

app.use(express.static(__dirname + "/"));

app.get("/dashboard", function(req, res){
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/positions", function(req, res){
    res.sendFile(path.join(__dirname, "/pages/positions.html"));
})

app.get("/updates", function (req, res){
    res.sendFile(path.join(__dirname, "/pages/updates.html"));
})

app.get("/login", function (req, res){
    res.sendFile(path.join(__dirname, "/pages/login.html"));
})

app.get("/register", function(req, res){
    res.sendFile(path.join(__dirname, "/pages/register.html"));
})

app.get("/profile", function(req,res){
    res.sendFile(path.join(__dirname, "/pages/profile.html"));
})

// Adds the user information to the mongoDB server
mongoose.connect("mongodb+srv://cesar:salad@cluster0.pjrclss.mongodb.net/accountsDB")

const accountsSchema = {
  username: String,
  password: String
}

const Account = mongoose.model("Account", accountsSchema);

app.post("/register", function(req, res){
   let newAccount = new Account({
      username: req.body.username,
      password: req.body.password
   });
   newAccount.save();
   res.redirect('/login');
})

// Retrives user information from the mongoDB server

// app.get("/login", (req, res) => {
//   Account.find({}, function(accounts){

//   })
// })


// Handles the Plaid API Requests
const config = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
        "Plaid-Version": "2020-09-14",
      },
    },
  });

const client = new PlaidApi(config);

app.get("/api/create_link_token", async (req, res, next) => {
    const tokenResponse = await client.linkTokenCreate({
      user: { client_user_id: req.sessionID },
      client_name: "Investify Development App",
      language: "en",
      products: ["auth"],
      country_codes: ["US"],
      redirect_uri: process.env.PLAID_SANDBOX_REDIRECT_URI,
    });
    res.json(tokenResponse.data);
});

app.post("/api/exchange_public_token", async (req, res, next) => {
    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token: req.body.public_token,
    });
    req.session.access_token = exchangeResponse.data.access_token;
    res.json(true);
});

app.get("/api/data", async (req, res, next) => {
    const access_token = req.session.access_token;
    const balanceResponse = await client.accountsBalanceGet({ access_token });
    res.json({
      Balance: balanceResponse.data,
    });
});

app.get("/api/is_account_connected", async (req, res, next) => {
    return (req.session.access_token ? res.json({ status: true }) : res.json({ status: false}));
});


// If the user accesses a route that does exist
app.all("/*", function(req, res){
  res.status(400).sendFile(path.join(__dirname, "/pages/404.html"));
})
  
app.listen(8000, console.log("Port listening in 8000"));