require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const session = require("express-session");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const bodyParser = require("body-parser"); 
const app = express();

app.set('view engine', 'ejs');

// Sets up the mongoDB 
mongoose.connect("mongodb+srv://cesar:salad@cluster0.pjrclss.mongodb.net/accountsDB")

const accountsSchema = {
  username: String,
  password: String
}

const Account = mongoose.model("Account", accountsSchema);


app.use(
    session({ secret: "cesar", saveUninitialized: true, resave: true })
  );

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handles all the routes for the application
app.get("/", (req, res) => {
    res.render('login');
})

app.use(express.static(__dirname + "/"));

app.get("/dashboard", function(req, res){
    res.render('dashboard')
})

app.get("/positions", function(req, res){
    res.render('positions');
})

app.get("/updates", function (req, res){
   res.render('updates');
})

app.get("/login", function (req, res){
    res.render('login');
})

app.get("/register", function(req, res){
    res.render('register');
})

app.get("/profile", function(req,res){
    res.render('profile');
})

// Handles the registration form
app.post("/register", async function(req, res){

  try{

    // First check if the user exists
    const user = await Account.findOne({ username: req.body.username })

    // If the user does exist, redirect back to the register page
    if(user){
      console.log("User already exists");
      res.redirect('register');

    // If the user does not exist, create the account
    } else {
      // Next check if the password matches
      if(req.body.password == req.body.password2){
        let newAccount = new Account({
          username: req.body.username,
          password: req.body.password
       });
       newAccount.save();
       console.log("Account was created succesfully");
       res.redirect('/login');
      
      // If the passwords do not match, redirect to the register page
      } else {
        console.log("Password do not match");
        res.redirect('register');
      }
    }
  } catch (error){
    console.log("error");
    res.redirect('register');
  }

})

// Handles the login form
app.post('/login', async function(req, res){
  try {
    // First check if the user exists
    const user = await Account.findOne({ username: req.body.username })
    if(user){
    // If user does exist, check if the password matches
      const result = req.body.password === user.password;
      if(result){
      console.log("Logged in successfully")
      res.render('dashboard');
      } else {  
      console.log("Password does not exist");
      res.redirect('/login');
      }
    } else {
      console.log("User does not exist");
      res.redirect('/login');
    }

  } catch (error) {
    console.log("error");
    res.redirect('/login');
  }

})

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
  res.status(400).render('404');
})
  
app.listen(8000, console.log("Port listening in 8000"));