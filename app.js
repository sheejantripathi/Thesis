const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");

const app = express();

//Middleware
app.use(bodyparser.json());
app.use(cors());

//Routes
app.get("/", (req, res) => {
    res.send('Hello, This is the basic level setup for Masters project')
})

module.exports = app;