import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import env from "dotenv"
import cors from 'cors'
import favicon from "serve-favicon"
import path from "path"
import { fileURLToPath } from 'url';
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const saltRounds = 10;
const port = 3000;
const { Pool } = pg

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(cors());
env.config();

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

async function getUserFinancialData(user) {

  const queries = {
    account: `
    SELECT available, dividends, assets
    FROM portfolio_information 
    JOIN account ON portfolio_information.id = account.id 
    WHERE account.id = $1
    `,

    positions: `
    SELECT name, ticker_symbol, type, cost_basis, institution_price, institution_price_as_of, institution_value, quantity, iso_currency_code, holdings.security_id 
    FROM account 
    JOIN holdings ON holdings.account_id = account.id 
    JOIN securities ON securities.security_id = holdings.security_id 
    WHERE account.id = $1 LIMIT 3
    `,

    transactions: `
    SELECT name, date, type, amount 
    FROM account 
    JOIN transactions ON transactions.account_id = account.id 
    WHERE account.id = $1
    `
  }

  const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT
  })

  try {
    const results = await Promise.all([
      pool.query(queries.account, [user.id]),
      pool.query(queries.positions, [user.id]),
      pool.query(queries.transactions, [user.id])
    ])

    return {
      accountData: results[0].rows[0],
      positionData: results[1].rows,
      transactionData: results[2].rows
    };

  } catch (error) {
    console.error("Error querying the user information", error);
    throw error;
  }
}

app.get("/dashboard", ensureAuthenticated, async (req, res) => {

  try {
    const user = req.user
    const result = await getUserFinancialData(user);

    res.render("dashboard.ejs", {
      username: user.username,
      account: result.accountData,
      position: result.positionData,
      transaction: result.transactionData
    });

  } catch (err) {
    // Internal Server Error
    res.redirect("/login");
    console.log(err);
  }
})

app.get("/positions", ensureAuthenticated, async (req, res) => {

  try {
    const user = req.user;

    const positionResult = await db.query(
      "SELECT name, ticker_symbol, type, cost_basis, institution_price, institution_price_as_of, institution_value, quantity, iso_currency_code, holdings.security_id FROM account JOIN holdings ON holdings.account_id = account.id LEFT JOIN securities ON securities.security_id = holdings.security_id WHERE account_id = $1", [user.id]);

    const positionData = positionResult.rows

    res.render("positions.ejs", {
      username: user.username,
      positionData: positionData
    })

  } catch (err) {
    console.log(err)
  }

})

app.get("/news", ensureAuthenticated, async (req, res) => {
  const user = req.user.username;
  const category = req.query.category || "general";

  try {
    const [finnResponse, fmpGainers, fmpLosers] = await Promise.all([
      axios.get("https://finnhub.io/api/v1/news", {
        params: {
          category: category,
          token: process.env.FINN_TOKEN_ID
        }
      }),

      axios.get("https://financialmodelingprep.com/api/v3/stock_market/gainers", {
        params: {
          apikey: process.env.FMP_TOKEN_ID
        }
      }),

      axios.get("https://financialmodelingprep.com/api/v3/stock_market/losers", {
        params: {
          apikey: process.env.FMP_TOKEN_ID
        }
      })
    ])

    res.render("news.ejs", {
      username: user,
      news: finnResponse.data,
      topGainers: fmpGainers.data,
      topLosers: fmpLosers.data,
    });

  } catch (error) {
    console.error("There was an error getting the news data", error);
    res.redirect("/dashboard")
  }
});

app.get("/profile", ensureAuthenticated, async (req, res) => {
  const user = req.user;

  const userData = await getUserFinancialData(user);
  const dataExists = !!(userData.positionData.length > 0 || userData.transactionData.length > 0);

  res.render("profile.ejs", {
    username: user.username,
    linkPlaid: dataExists
  });
})

/* ========================== Plaid Token Exchange ========================== */

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

app.post('/create_link_token', ensureAuthenticated, async (req, res) => {
  try {
    const response = await client.linkTokenCreate({
      user: {
        client_user_id: String(req.user.id)
      },
      client_name: 'Investify',
      products: ['investments'],
      required_if_supported_products: ['auth'],
      country_codes: ['US'],
      language: "en"
    });

    res.json(response.data);
    console.log(response.data)
  } catch (error) {
    console.error('Error', error);

    res.json({
      error: error.message
    });
  }
});

// Function for getting the user's securities and holdings data
async function getHoldings(access_token) {
  const request = {
    access_token: access_token,
  };

  try {
    const response = await client.investmentsHoldingsGet(request);
    return response.data;
  } catch (error) {

    console.error("Error fetching holdings:", error);
    throw error;
  }
}

// Function for getting the user's investment transactions 
async function getInvestmentTransactions(access_token, start_date, end_date, count = 20, offset = 0) {
  const request = {
    access_token: access_token,
    start_date: start_date,
    end_date: end_date,
    options: {
      count: count,
      offset: offset,
    },
  };

  try {
    const response = await client.investmentsTransactionsGet(request);
    return response.data.investment_transactions;
  } catch (error) {
    console.error("Error fetching investment transactions:", error);
    throw error;
  }
}

async function insertTransactions(dataArray, user) {
  const query = `
  INSERT INTO transactions (name, date, type, amount, account_id)
  VALUES ($1, $2, $3, $4, $5)
  `
  const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT
  })

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const data of dataArray) {
        await client.query(query, [data.name, data.date, data.type, data.amount, user.id])
      }

      await client.query('COMMIT');

      console.log("Inserted the rows in the transactions table")

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("There was an error executing the transactions batch query", error)
  } finally {
    await pool.end();
  }

}

async function insertHoldings(dataArray, user) {
  const query = `
  INSERT INTO holdings (cost_basis, institution_price, institution_price_as_of, institution_value, quantity, iso_currency_code, security_id, account_id)
  VALUES($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT
  })

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const data of dataArray) {
        await client.query(query, [data.cost_basis, data.institution_price, data.institution_price_as_of, data.institution_value, data.quantity, data.iso_currency_code, data.security_id, user.id]);
      }

      await client.query('COMMIT');

      console.log("Inserted the rows in holdings table");

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("There was an error executing the holdings batch query", error);
  } finally {
    await pool.end();
  }

}

async function insertSecurities(dataArray) {
  const query = `
      INSERT INTO securities (name, ticker_symbol, type, isin, cusip, security_id)
      VALUES ($1, $2, $3, $4, $5, $6)  
  `

  const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT
  })

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const data of dataArray) {
        await client.query(query, [data.name, data.ticker_symbol, data.type, data.isin, data.cusip, data.security_id]);
      }

      await client.query('COMMIT');

      console.log("Inserted the rows in securities table");

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("There was an error excuting the securities batch query", error);
  } finally {
    await pool.end();
  }

}

async function updateAccountInformation(dataArray, user) {
  console.log(dataArray);

  try {
    await db.query("UPDATE portfolio_information SET available = $1, dividends = $2, assets = $3 WHERE id = $4", [dataArray.available, dataArray.available, dataArray.current, user.id])
    console.log("Account information has been updated");

  } catch (error) {
    console.error("Error updating the account information for the user:", error);
  }

}

app.post('/exchange_public_token', ensureAuthenticated, async function (
  request,
  response,
  next,
) {

  const publicToken = request.body.public_token;
  try {
    const response = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });
    // Access token that is created for the user
    const accessToken = response.data.access_token;
    const itemID = response.data.item_id;
    const currentUser = request.user;

    // Get a list of holdings and positions for the user
    const holdingsResult = await getHoldings(accessToken);
    // await insertHoldings(holdingsResult.holdings, currentUser);
    // await insertSecurities(holdingsResult.securities);


    // Get a list of transactions for the user
    const transactionsResult = await getInvestmentTransactions(accessToken, '2019-01-01', '2024-07-29')
    // await insertTransactions(transactionsResult, currentUser);


    // Update user portfolio information
    const updateProfile = await updateAccountInformation(holdingsResult.accounts[0].balances, currentUser);

  } catch (error) {
    console.log("Error", error);
  }
});

/* ========================== Update Account ========================== */

app.post("/update", async (req, res) => {
  const user = req.user;
  const newUsername = req.body.username;
  const newPassword = req.body.password;

  try {
    if (newUsername != "" && newPassword != "") {

      try {
        const result = await db.query("SELECT * FROM account WHERE username = $1", [newUsername])

        if (result.rows.length > 0) {
          console.log("Account already exists");
          res.render("profile.ejs", {
            username: user.username,
            error: "Username already exists"
          })
        } else {
          bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
            if (err) {
              console.log("Error hashing the password:", err);
            } else {
              await db.query("UPDATE account SET username = $1, password = $2 WHERE id = $3", [newUsername, hash, user.id])
              console.log("Success");
            }
          })
          res.redirect("/login")
        }

      } catch (err) {
        console.log(err);
      }

    } else if (newUsername != "") {

      try {
        const result = await db.query("SELECT * FROM account WHERE username = $1", [newUsername])

        if (result.rows.length > 0) {
          console.log("Account already exists");
          res.render("profile.ejs", {
            username: user.username,
            error: "Username already exists"
          })
        } else {
          await db.query("UPDATE account SET username = $1 WHERE id = $2", [newUsername, user.id])
          res.redirect("/login")
        }

      } catch (err) {
        console.log(err);
      }

    } else if (newPassword != "") {

      try {

        bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
          if (err) {
            console.log("Error hashing the password:", err)
          } else {
            await db.query("UPDATE account SET password = $1 WHERE id = $2", [hash, user.id]);
            res.redirect("/login")
          }
        })

      } catch (err) {
        console.log(err);
      }

    } else {
      console.log("Nothing happened");
      res.redirect("/profile")
    }

  } catch (err) {
    console.log(err);
  }

})

/* ========================== Delete Account ========================== */

app.post("/delete", async (req, res) => {
  const user = req.body

  try {
    await db.query("SELECT * FROM account WHERE id = $1", [user.id])
    // await db.query("DELETE FROM account WHERE id = $1", [user.id])
    console.log("Account has been deleted")
    res.redirect("/login");

  } catch (err) {
    console.log(err);
  }

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

          await db.query("INSERT INTO portfolio_information (id, available, dividends, assets) VALUES ($1, 0, 0, 0)", [result.rows[0].id])

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
      return cb(null, false);
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