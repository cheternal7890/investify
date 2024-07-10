import express from "express";
import bodyParser from "body-parser"
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUser = ""
let userById = ""

// Setting up Database Client

const db = new pg.Client({
  user: "postgres.ormzewzckwyfqgyfukcc",
  password: "p4pv4mm13bpP!",
  host: "aws-0-us-east-1.pooler.supabase.com",
  database: "postgres",
  port: 6543
})

db.connect();

// Handles all the routes
app.get("/", (req, res) => {
  res.render("login.ejs");
})

app.get("/login", (req, res) => {
  res.render("login.ejs");
})

app.get("/register", (req, res) => {
  res.render("register.ejs");
})

app.get("/dashboard", async (req, res) => {
  console.log(userById);

  try {
    const result = await db.query("SELECT * FROM accounts JOIN portfolio_information ON accounts.id = portfolio_information.id WHERE username = $1", [currentUser])

    const data = result.rows[0]

    console.log(data);

    res.render("dashboard.ejs", {
      username: currentUser,
      account: data
    });

  } catch (err) {
    console.log("There was an error executing this query");
  }
  db.ae

})

app.get("/positions", (req, res) => {
  res.render("positions.ejs", {
    username: currentUser
  });
})

app.get("/updates", (req, res) => {
  res.render("updates.ejs", {
    username: currentUser
  });
})

app.get("/profile", (req, res) => {
  res.render("profile.ejs", {
    username: currentUser
  });
})

/* Handles the login and registration form */
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT id, username, password FROM accounts WHERE username=$1 AND password=$2", [username, password])

    const data = result.rows[0];

    userById = data.id;

    if (data.username == username && data.password == password) {
      console.log("Success");
      currentUser = data.username
      res.redirect("/dashboard")
    }

  } catch (err) {
    console.log("That account does not exist");
    res.render("login.ejs", {
      error: "Login or password is invalid..."
    })
  }
})

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  try {
    // First create the account
    const createAccount = await db.query("INSERT INTO accounts (email, username, password) VALUES ($1, $2, $3)", [email, username, password]);

    // Find the new account
    const findNewAccount = await db.query("SELECT * FROM accounts WHERE username=$1", [username])

    // Retrieve the data of the new account
    const data = findNewAccount.rows[0]

    // Every new account that is made will have the default values of 0
    if (createAccount) {
      const insertDefaultData = await db.query("INSERT INTO portfolio_information (id, settled_cash, buying_power, dividends, balance) VALUES ($1, 0, 0, 0, 0)", [data.id])
      res.redirect("/login");
    }
  } catch (err) {
    console.log("Account already exists");
    res.render("register.ejs", {
      error: "Email or username already exists"
    })
  }

})

// If the user accesses a route that does exist
app.all("/*", (req, res) => {
  res.status(400).render('404.ejs');
})

app.listen(3000, console.log(`Listening on port ${port}`));