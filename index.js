// var express = require('express')
//   , passport = require('passport')
//   , util = require('util')
//   , wsfedsaml2 = require('../../lib/passport-wsfed-saml2/index').Strategy
//   , fs = require('fs');

var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , wsfedsaml2 = require('passport-wsfed-saml2').Strategy
  , fs = require('fs')
  , morgan = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , session = require('express-session');

var users = [
    { id: 1, givenName: 'matias', email: 'matias@auth10.com' }
  , { id: 2, givenName: 'foo', email: 'foo@gmail.com' }
];

function findByEmail(email, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.email === email) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(id, done) {
  findByEmail(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new wsfedsaml2(
  {
    path: '/login/callback',
    realm: 'urn:dev2:knomatic',
    identityProviderUrl: 'https://dc.knomatic.com/adfs/ls',
    //thumbprint: '3F69575310D3A85E16165BE434252C49E4419A4B'
    // setup either a certificate base64 encoded (cer) or just the thumbprint of the certificate if public key is embedded in the signature
    cert: 'MIICvDCCAaQCCQClWYojYx5BQjANBgkqhkiG9w0BAQUFADAgMR4wHAYDVQQDExVk ZXYtZmlsZS5rbm9tYXRpYy5jb20wHhcNMTcwNjAyMDQxMDA0WhcNMjcwNjAyMDQx MDA0WjAgMR4wHAYDVQQDExVkZXYtZmlsZS5rbm9tYXRpYy5jb20wggEiMA0GCSqG SIb3DQEBAQUAA4IBDwAwggEKAoIBAQDsulZsai7+pv4PIcP7foK4UyzsdV23qT0e HXvIde6QC9SYk3Pa9VBi/8Z9nwI+oTi5zdPQGJDZWV14A07+kE5diq/MMtLmEZTA 1NSVrrEKOBXKqwHADGVW7Q1EfVqrU0erRWdLt/PYvSleEYNT+m18SCbLh1pboN0H YVjMLQirUpoKeKsZ3bu8fzaHaWd1+3YsQoWvw+KcDkw70gjhHzhuqZEK+6BkRBhi fZ03Orp/GqrANf45eTqyJFuC5seSj/z0TrWM1Bbjr3nRXDOkpOYd9XKNqokSJlEa NTRoAQf882WVFBFf5GwRbvcM3qzzb7VCkUlu5H9SWuo0fx830ruPAgMBAAEwDQYJ KoZIhvcNAQEFBQADggEBALo5CCt2d1G6OR34eJ33fbT9Y5Azgdzn2AS7AVN0s1fi uhDx7o/VrRyDs92Vbw1D8jCAHLHW1Nz1ojmCK/1C1zRl/gIxncb4NLP2xXLGMvAn DUnOZDHnDoBTbtHYr8Axv88/56xc7Aq5kLOV++7PtEzcMAbHTql8qv/rrHYK/TTm MhvRnveaWOyiw+9fXVfu8yV/sztpwtC6Xhf/ZLIGO6MfvwFd/RrkR4JyG7EVmyoF WCJdrG3Z22s4G0KVTbWtcIZbfXcX5VTr9nR/dTFXFzCz1nKXckgtfAgNtGMp8OKs vf9IVtoIGSQiTuPixkwfyoUhOsTmwktqOuoWUzx37Zo='
  },
  function(profile, done) {
    console.log("Auth with", profile);
    if (!profile.email) {
      return done(new Error("No email found"), null);
    }
    // asynchronous verification, for effect...
    process.nextTick(function () {
      findByEmail(profile.email, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          // "Auto-registration"
          users.push(profile);
          return done(null, profile);
        }
        return done(null, user);
      })
    });
  }
));

var app = express();
var router = express.Router();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());
app.use(session({ 
  secret: 'keyboard cat',
  resave: false,
 saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('', router);
app.use(express.static(__dirname + '/../../public'));


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login',
  passport.authenticate('wsfed-saml2', { failureRedirect: '/', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  }
);

app.post('/login/callback',
  passport.authenticate('wsfed-saml2', { failureRedirect: '/', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  }
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(8001, function () {
  console.log("Server listening in http://localhost:4000");
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}