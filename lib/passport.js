var fs = require('fs')
var passport = require('passport')
var wsfedsaml2 = require('passport-wsfed-saml2').Strategy
var config  = require('../config.js')

passport.serializeUser(function(user, done) {
 console.log('user inside serialize' , user) 
 done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new wsfedsaml2(config.wsfedsaml2,
   function(profile, done) {
     console.log("Auth with", profile);
     return done(null, profile);
   }
));


module.exports = passport;
