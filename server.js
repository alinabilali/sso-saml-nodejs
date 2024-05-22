require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const passport = require('passport');
const PORT = process.env.PORT || 3500;
const config = require('./config');

require('./passport')(passport);

// Express.js middleware setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.post(
  config.passport.saml.path,
  passport.authenticate(config.passport.strategy, {
    failureRedirect: '/',
    failureFlash: true,
  }),
  function (req, res) {
    res.redirect('/');
  }
);

app.get('/login', (req, res) => {
  // Initiate SSO authentication directly
  // Note: passport.authenticate('saml') initiates the SSO process
  passport.authenticate('saml', {
    failureRedirect: '/login', // Redirect to login if SSO fails
    failureFlash: true,
  })(req, res);
});

const checkRole = (role) => {
  return (req, res, next) => {
    const userRole = req.session.user ? req.session.role : null;

    if (userRole === role) {
      next();
    } else {
      res.status(403).render('forbidden');
    }
  };
};

// Routes

app.get('/landing', (req, res) => {
  // Render the landing.ejs view
  res.render('landing');
});

app.get('/', (req, res) => {
  res.redirect('/landing');
});

app.get('/home', (req, res) => {
  req.isAuthenticated()
    ? res.render('home', {
        username: req.session.user,
        message: req.session.message,
        role: req.session.role,
      })
    : res.redirect('/login');
});

app.post('/login/callback', (req, res, next) => {
  passport.authenticate('saml', (err, user, info) => {
    try {
      console.log('SAML Authentication Info:', info);

      if (err) {
        console.error('Error in SSO authentication:', err);
        return res.render('login', { error: 'SSO authentication failed' });
      }

      if (!user) {
        console.error('User not found');
        return res.render('login', { error: 'User not found' });
      }

      // Authenticate the user and set up the session
      req.logIn(user, function (loginErr) {
        if (loginErr) {
          console.error('Error logging in:', loginErr);
          return res.render('login', { error: 'Login failed' });
        }
        console.log(info);
        req.session.user = info?.profile?.username;
        return res.redirect('/home');
      });
    } catch (error) {
      console.error('Error in SSO callback:', error);
      return res.render('login', { error: 'SSO callback failed' });
    }
  })(req, res, next);
});

app.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

app.get('/page1', checkRole('admin'), (req, res) => {
  req.isAuthenticated() ? res.render('page1') : res.redirect('/login');
});

app.get('/page2', (req, res) => {
  req.isAuthenticated() ? res.render('page2') : res.redirect('/login');
});

app.listen(PORT, () => console.log(`Server running at Port ${PORT}`));
