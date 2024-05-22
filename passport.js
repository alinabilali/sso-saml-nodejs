const SamlStrategy = require('passport-saml').Strategy;
const config = require('./config');

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

 passport.use(
  new SamlStrategy(config.passport.saml, function (profile, done, req) {
    try {
      // Access the firstName from the SAML profile
      const { uid, email, firstName } = profile;

      // The `info` parameter is added to the callback
      return done(null, {
        id: uid,
        email: email,
        firstName: firstName,
      }, { message: 'Authentication successful', profile: profile });
    } catch (error) {
      console.error('Error in SAML authentication:', error);
      return done(error);
    }
  })
);
}

