var fs = require('fs')
var passport = require('passport')
var wsfedsaml2 = require('passport-wsfed-saml2').Strategy


passport.serializeUser(function(user, done) {
 console.log('user inside serialize' , user) 
 done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new wsfedsaml2(
   {
     path: '/adfs/callback',
     realm: 'urn:dev3:knomatic',
     identityProviderUrl: 'https://dc.knomatic.com/adfs/ls',
     thumbprint: '‎C2C561DDA76F69B0EA223C047A88113BF8CCD8CD',
   },
   function(profile, done) {
     console.log("Auth with", profile);
     return done(null, profile);
   }
));


module.exports = passport;