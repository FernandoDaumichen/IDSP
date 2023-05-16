const express = require("express");
const router = express.Router();
const passport = require("../passport-middleware");
const { forwardAuthenticated } = require("../middleware");
const { createUser } = require("../database");
const prisma = require("../prisma/client");

router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  const user = await createUser(req.body);
  if (user) {
    res.redirect("/auth/login");
  } else {
    res.redirect("/auth/signup");
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/feeds/home",
    failureRedirect: "/auth/login",
  })
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
