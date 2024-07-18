import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import env from "dotenv"

const app = express();
const saltRounds = 10;
const port = 3000;
env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}))

app.use(passport.initialize());
app.use(passport.session());

/* ========================== Connect to Database ========================== */

const db = new pg.Client({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT
});

db.connect();

/* ========================== Middleware Authentication ========================== */

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

/* ========================== Main Routes ========================== */

app.get("/", (req, res) => {
  res.redirect("/dashboard")
})

app.get("/login", (req, res) => {
  res.render("login.ejs");
})

app.get("/register", (req, res) => {
  res.render("register.ejs");
})

app.get("/dashboard", ensureAuthenticated, async (req, res) => {

  try {
    const user = req.user.username

    const result = await db.query(
      "SELECT settled_cash, buying_power, dividends, balance FROM account JOIN portfolio_information ON portfolio_information.id = account.id WHERE username = $1", [user])
    const data = result.rows[0];

    const positionResult = await db.query(
      "SELECT name, unrealized_gains FROM account JOIN position_table ON position_table.account_id = account.id WHERE username = $1 LIMIT 3", [user]);
    const positionData = positionResult.rows

    res.render("dashboard.ejs", {
      username: user,
      account: data,
      position: positionData
    });

  } catch (err) {
    console.log(err);
  }
})

app.get("/positions", ensureAuthenticated, async (req, res) => {

  try {
    const user = req.user.username;

    const positionResult = await db.query(
      "SELECT * FROM account JOIN position_table ON position_table.account_id = account.id WHERE username = $1 LIMIT 3", [user]);
    const positionData = positionResult.rows

    res.render("positions.ejs", {
      username: user,
      positionData: positionData
    })

  } catch (err) {
    console.log(err)
  }

})

app.get("/updates", ensureAuthenticated, (req, res) => {
  const user = req.user.username;

  res.render("updates.ejs", {
    username: user,
  });
})

app.get("/profile", ensureAuthenticated, (req, res) => {
  const user = req.user.username;

  res.render("profile.ejs", {
    username: user,
  });
})

/* ========================== Register Account ========================== */

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM account WHERE email = $1", [email])

    if (checkResult.rows.length > 0) {
      res.send("Account already exists. Try logging in");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {

        if (err) {
          console.log("Error hashing the password:", err);
        } else {
          const result = await db.query("INSERT INTO account (email, username, password) VALUES ($1, $2, $3) RETURNING *", [email, username, hash])

          await db.query("INSERT INTO portfolio_information (id, settled_cash, buying_power, dividends, balance) VALUES ($1, 0, 0, 0, 0)", [result.rows[0].id])

          res.redirect("/login");
        }

      });
    }

  } catch (err) {
    console.log(err);
  }

})

/* ========================== Log in ========================== */

app.post("/login", passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/login"
}))

/* ========================== Log out ========================== */

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login")
    }
  })
})

passport.use(new Strategy(async function verify(username, password, cb) {

  try {

    const result = await db.query("SELECT * FROM account WHERE username = $1", [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0]
      const hashedPassword = user.password

      bcrypt.compare(password, hashedPassword, (err, result) => {
        if (err) {
          return cb(err)
        } else {
          if (result) {
            return cb(null, user)
          } else {
            return cb(null, false)
          }
        }
      });


    } else {
      return cb("User not found");
    }

  } catch (err) {
    return cb(err);
  }

}))

passport.serializeUser((user, cb) => {
  cb(null, user);
})

passport.deserializeUser((user, cb) => {
  cb(null, user);
})

/* ========================== 404 Fallback ========================== */

app.all("/*", (req, res) => {
  res.status(400).render('404.ejs');
})

app.listen(3000, console.log(`Listening on port ${port}`))