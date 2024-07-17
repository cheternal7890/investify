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
  try {
    const result = await db.query("SELECT * FROM accounts JOIN portfolio_information ON accounts.id = portfolio_information.id WHERE username = $1", [currentUser])
    const data = result.rows[0]

    const positionData = await db.query("SELECT position_data.id, identifier, name, price, type, unrealized_gains, realized_gains FROM accounts JOIN portfolio_information ON portfolio_information.id = accounts.id JOIN position_data ON position_data.account_id = portfolio_information.id WHERE username = $1 LIMIT 3", [currentUser]);
    const positionResult = positionData.rows

    if (data) {
      res.render("dashboard.ejs", {
        username: currentUser,
        account: data,
        position: positionResult
      });

    }

  } catch (err) {
    console.log("There was an error executing this query");
  }
  db.ae

})

app.get("/positions", async (req, res) => {

  try {
    const result = await db.query("SELECT position_data.id, identifier, name, price, type, unrealized_gains, realized_gains FROM accounts JOIN portfolio_information ON portfolio_information.id = accounts.id JOIN position_data ON position_data.account_id = portfolio_information.id WHERE username = $1", [currentUser]);

    const data = result.rows

    if (data.length > 1) {
      res.render("positions.ejs", {
        username: currentUser,
        positionData: result.rows
      });
    } else {
      res.render("positions.ejs", {
        username: currentUser,
      });
    }
  } catch (err) {
    res.render("positions.ejs", {
      username: currentUser,
    });
  }

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

    if (data.username == username && data.password == password) {
      currentUser = data.username
      userById = data.id;
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

app.post("/update", async (req, res) => {
  console.log(req.body);

  console.log("Current user =", currentUser)
  console.log("User's ID =", userById)

  // try {
  //   await db.query("UPDATE accounts SET username = $1, ")


  // } catch (err) {
  //   console.log(err);
  // }


})

app.post("/delete", (req, res) => {
  console.log(req.body);
})


// If the user accesses a route that does exist
app.all("/*", (req, res) => {
  res.status(400).render('404.ejs');
})

app.listen(3000, console.log(`Listening on port ${port}`));