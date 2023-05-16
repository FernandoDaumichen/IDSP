const express = require("express");
const router = express.Router();
const database = require("../database");

router.get("/", (req, res) => {
  res.render("index.ejs", {
    numberOfItterations: 50,
  });
});

module.exports = router;
