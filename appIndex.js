const express = require("express");
const moment = require("moment-timezone");
const routes = require("./routes");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
moment.tz.setDefault("Europe/Warsaw");

app.use(cors({ origin: "*" }));

app.use(
  bodyParser.json({  limit: "50mb" })
);
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use("/", routes);

module.exports = app;