const express = require('express');
const path = require('path');
const app = express();


app.use(express.static(path.join(__dirname, "/")));

app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/positions", async (req, res) => {
    res.sendFile(path.join(__dirname, "/pages/positions.html"));
})

app.get("/updates", async (req, res) => {
    res.sendFile(path.join(__dirname, "/pages/updates.html"));
})

app.listen(3000);