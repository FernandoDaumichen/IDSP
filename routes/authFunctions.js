const express = require("express");
const router = express.Router();
const passport = require("../passport-middleware");
const { forwardAuthenticated } = require("../middleware");
const { createUser, updatePassword, getUserByUsername, getSecretFromUser } = require("../database");
const prisma = require("../prisma/client");

router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

router.get("/forgot", forwardAuthenticated, (req, res) => res.render("forgot"));

router.get("/forgotPartTwo", forwardAuthenticated, async (req, res) => {
  const username = req.app.locals.user;
  if (!username) {
    res.redirect("/auth/login");
  } else {
    const { secretQuestion, secretAnswer } = await getSecretFromUser(username);
    res.render("forgotPartTwo", { secretQuestion, secretAnswer })
  }
})

router.post("/forgotPassword", async (req, res) => {

 const user = await getUserByUsername(req.body.username);
 if (user) {
  req.app.locals.user = req.body.username;
  res.redirect("/auth/forgotPartTwo");
 } else {
  res.redirect("/auth/forgot");
 }

})

router.post("/updatePassword", async (req, res) => {
  const username = req.app.locals.user;
  const password = req.body.password;
  await updatePassword(username, password);
  res.redirect("/auth/login");
})
router.post("/resetVerify", async (req, res) => {
  const username = req.app.locals.user;
  const answerInput = req.body.secretAnswer;
  const { secretAnswer } = await getSecretFromUser(username);
  if (answerInput == secretAnswer) {
    res.render("reset")
  } else {
    res.redirect("/auth/login");
  }
//  const user = await getUserByUsername(req.body.username);
//  if (user) {
//   req.app.locals.user = req.body.username;
//   res.redirect("/auth/forgotPartTwo");
//  } else {
//   res.redirect("/auth/forgot");
//  }

})


router.get("/signup", (req, res) => res.render("signup"));

router.post("/signup", async (req, res) => {
  try {
    const user = await createUser(req.body);
    if (user) {
      res.redirect("/auth/login");
    } else {
      res.redirect("/auth/signup");
    }
  } catch (error) {
    console.log(error);
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
  req.logout(function(err) {
    if (err) {
      console.error(err);
    }
    res.redirect("/");
  });
});


module.exports = router;
