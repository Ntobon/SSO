// var express = require('express')
//   , passport = require('passport')
//   , util = require('util')
//   , wsfedsaml2 = require('../../lib/passport-wsfed-saml2/index').Strategy
//   , fs = require('fs');

var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , wsfedsaml2 = require('passport-wsfed-saml2').Strategy
  , SamlStrategy = require('passport-saml').Strategy
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
     realm: 'urn:dev3:knomatic',
     identityProviderUrl: 'https://dc.knomatic.com/adfs/ls',
     thumbprint: '‎C2C561DDA76F69B0EA223C047A88113BF8CCD8CD',
   },
   function(profile, done) {
     console.log("Auth with", profile);
     return done(null, profile);
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

app.listen(8002, function () {
  console.log("Server listening in http://localhost:8002");
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
