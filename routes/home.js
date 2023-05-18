const express = require("express");
const router = express.Router();
const database = require("../database");

router.get("/", (req, res) => {
  try {
    res.render("index.ejs", {
      numberOfIterations: 50,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
