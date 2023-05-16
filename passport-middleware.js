const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const database = require("./database");

const localLogin = new LocalStrategy(async (username, password, done) => {
  const user = await database.getUserByUsernameAndPassword(username, password);
  return user
    ? done(null, user)
    : done(null, false, {
        message: "Your login details are not valid. Please try again",
      });
});

passport.serializeUser(function (user, done) {
  done(null, user.id);
  // Create a session for the user
  // Creates a special variable for us called req.user
});

passport.deserializeUser(async function (id, done) {
  let user = await database.getUserByUserId(id);
  if (user) {
    done(null, user);
  } else {
    done({ message: "User not found" }, null);
  }
});

module.exports = passport.use(localLogin);
