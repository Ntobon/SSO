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


//passport.use(new SamlStrategy(
//  {
//    entryPoint: 'https://dc.knomatic.com/adfs/ls',
//    issuer: 'dev_file_knomatic',
//    callbackUrl: 'https://dev-file.knomatic.com/login/callback',
//    privateCert: fs.readFileSync(__dirname + '/sso-cert/dev_knomatic_com.key', 'utf-8'),
//    cert: fs.readFileSync(__dirname + '/sso-cert/dc.knomatic.com.crt', 'utf-8'),
  // other authn contexts are available e.g. windows single sign-on
//    authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password',
  // not sure if this is necessary?
//    acceptedClockSkewMs: -1,
//    identifierFormat: null,
  // this is configured under the Advanced tab in AD FS relying party
//    signatureAlgorithm: 'sha256'
//  },
//  function(profile, done) {
//    return done(null,
 //     {
//        upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'],
        // e.g. if you added a Group claim
//        group: profile['http://schemas.xmlsoap.org/claims/Group']
//    });
//  }
//));


 passport.use(new wsfedsaml2(
   {
     path: '/login/callback',
//    jwt: {
      //same options than node-jsonwebtoken
//      algorithm: 'RS256'
//    },
     realm: 'urn:dev3:knomatic',
     identityProviderUrl: 'https://dc.knomatic.com/adfs/ls',
     thumbprint: '‎C2C561DDA76F69B0EA223C047A88113BF8CCD8CD',
     // setup either a certificate base64 encoded (cer) or just the thumbprint of the certificate if public key is embedded in the signature
//     cert: 'MIICvDCCAaQCCQClWYojYx5BQjANBgkqhkiG9w0BAQUFADAgMR4wHAYDVQQDExVk ZXYtZmlsZS5rbm9tYXRpYy5jb20wHhcNMTcwNjAyMDQxMDA0WhcNMjcwNjAyMDQx MDA0WjAgMR4wHAYDVQQDExVkZXYtZmlsZS5rbm9tYXRpYy5jb20wggEiMA0GCSqG SIb3DQEBAQUAA4IBDwAwggEKAoIBAQDsulZsai7+pv4PIcP7foK4UyzsdV23qT0e HXvIde6QC9SYk3Pa9VBi/8Z9nwI+oTi5zdPQGJDZWV14A07+kE5diq/MMtLmEZTA 1NSVrrEKOBXKqwHADGVW7Q1EfVqrU0erRWdLt/PYvSleEYNT+m18SCbLh1pboN0H YVjMLQirUpoKeKsZ3bu8fzaHaWd1+3YsQoWvw+KcDkw70gjhHzhuqZEK+6BkRBhi fZ03Orp/GqrANf45eTqyJFuC5seSj/z0TrWM1Bbjr3nRXDOkpOYd9XKNqokSJlEa NTRoAQf882WVFBFf5GwRbvcM3qzzb7VCkUlu5H9SWuo0fx830ruPAgMBAAEwDQYJ KoZIhvcNAQEFBQADggEBALo5CCt2d1G6OR34eJ33fbT9Y5Azgdzn2AS7AVN0s1fi uhDx7o/VrRyDs92Vbw1D8jCAHLHW1Nz1ojmCK/1C1zRl/gIxncb4NLP2xXLGMvAn DUnOZDHnDoBTbtHYr8Axv88/56xc7Aq5kLOV++7PtEzcMAbHTql8qv/rrHYK/TTm MhvRnveaWOyiw+9fXVfu8yV/sztpwtC6Xhf/ZLIGO6MfvwFd/RrkR4JyG7EVmyoF WCJdrG3Z22s4G0KVTbWtcIZbfXcX5VTr9nR/dTFXFzCz1nKXckgtfAgNtGMp8OKs vf9IVtoIGSQiTuPixkwfyoUhOsTmwktqOuoWUzx37Zo='
//     cert:'MIIFMDCCBBigAwIBAgIJAPINt0koPbZ6MA0GCSqGSIb3DQEBCwUAMIG0MQswCQYD VQQGEwJVUzEQMA4GA1UECBMHQXJpem9uYTETMBEGA1UEBxMKU2NvdHRzZGFsZTEa MBgGA1UEChMRR29EYWRkeS5jb20sIEluYy4xLTArBgNVBAsTJGh0dHA6Ly9jZXJ0 cy5nb2RhZGR5LmNvbS9yZXBvc2l0b3J5LzEzMDEGA1UEAxMqR28gRGFkZHkgU2Vj dXJlIENlcnRpZmljYXRlIEF1dGhvcml0eSAtIEcyMB4XDTE2MTEzMDEwMzAwMFoX DTE4MDEyOTIwNTEzOVowPDEhMB8GA1UECxMYRG9tYWluIENvbnRyb2wgVmFsaWRh dGVkMRcwFQYDVQQDDA4qLmtub21hdGljLmNvbTCCASIwDQYJKoZIhvcNAQEBBQAD ggEPADCCAQoCggEBAJowc0tPblOhOZH8zAMm2GpqHtSOwhCTzz5xAYEnyfqHtk+P cR27TVxBEReNhaN6UXkR8LRz1ZuQzRGc71HDj529myF2Yp0LW2IPJesu4Q+8eLDz CKtTxXzkxicMUIzIDDLRMcVzawwDJh0q+kNuMR4SutDE8ocwhmdwOE7m0YYSfA2Y gGfhgoWvr6cc7qYLyWe9VVeomPVdPvCV/u10GFem6HdemFe7qkLw7C2MKwiH6USk /7sey3CvXDuWr9kTiJjtljJR4Woftpv5NJSP/p7G9VRi6KcBY0MNIC14VWEqFAiF yTUpksyoQgyCIAa1r/2qRHwCsZVjzUDgO6wiGk0CAwEAAaOCAbowggG2MAwGA1Ud EwEB/wQCMAAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMA4GA1UdDwEB /wQEAwIFoDA3BgNVHR8EMDAuMCygKqAohiZodHRwOi8vY3JsLmdvZGFkZHkuY29t L2dkaWcyczEtMzU0LmNybDBdBgNVHSAEVjBUMEgGC2CGSAGG/W0BBxcBMDkwNwYI KwYBBQUHAgEWK2h0dHA6Ly9jZXJ0aWZpY2F0ZXMuZ29kYWRkeS5jb20vcmVwb3Np dG9yeS8wCAYGZ4EMAQIBMHYGCCsGAQUFBwEBBGowaDAkBggrBgEFBQcwAYYYaHR0 cDovL29jc3AuZ29kYWRkeS5jb20vMEAGCCsGAQUFBzAChjRodHRwOi8vY2VydGlm aWNhdGVzLmdvZGFkZHkuY29tL3JlcG9zaXRvcnkvZ2RpZzIuY3J0MB8GA1UdIwQY MBaAFEDCvSeOzDSDMKIz1/tss/C0LIDOMCcGA1UdEQQgMB6CDioua25vbWF0aWMu Y29tggxrbm9tYXRpYy5jb20wHQYDVR0OBBYEFLtEeZMYHN2Km9dHcDFMyIqWFV4f MA0GCSqGSIb3DQEBCwUAA4IBAQAFAWHXQXq9xxq4fPnjnVRTOLd62wey+LP8Xbl8 4/eJGL2ytb5FXTk8SrRj9WZHbfd89HIteJxfxNjVvMUmoR4R2YOcmfIKd1oH+Pxm vTwpTk2rs9m8PZWUabIPll3X8n6hovejCeqNKqBmNxlgDyTnLzIybAp/YcIp/K2E v3bMvC+B1Fo+jo5zsBG32sZ5n0AiLT02OTUx6KyoyeBbRy73+0RJjqPOD5zAcJJ6 akaJWYPBHm5S5BDPL7a6TDFGKF7iTId3mohmxsu8MzJsfWLtvMw4tddRXcFr9T2S OldnoDOMouTPCVQcLqrYBmufnPIhDhToyMXxODg5umcQ91Tn',
//     decryptionKey: 'MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCaMHNLT25ToTmR /MwDJthqah7UjsIQk88+cQGBJ8n6h7ZPj3Edu01cQREXjYWjelF5EfC0c9WbkM0R nO9Rw4+dvZshdmKdC1tiDyXrLuEPvHiw8wirU8V85MYnDFCMyAwy0THFc2sMAyYd KvpDbjEeErrQxPKHMIZncDhO5tGGEnwNmIBn4YKFr6+nHO6mC8lnvVVXqJj1XT7w lf7tdBhXpuh3XphXu6pC8OwtjCsIh+lEpP+7Hstwr1w7lq/ZE4iY7ZYyUeFqH7ab +TSUj/6exvVUYuinAWNDDSAteFVhKhQIhck1KZLMqEIMgiAGta/9qkR8ArGVY81A 4DusIhpNAgMBAAECggEAXjnRm2pVL8JNHkvwmNR6WL21TYxYSC0r7yq8EqOwKOwa m5A7PkIiSohw24Xe70Jm26f9AynulfztdSAEmGD8OReP3+kq5nH0TH6ZW5nwa99v miNLXvf4rhRYi7BY4U+3NK7mzZV1C4g5GIYVHnQOjCRCCibxV3BuEnRf1Mf1rwpV 1rZOQXAKRpoSFlVBFI+D6OFImNx6DbsQHvw1WWPCW1ulxY9Go/Vnln3i+RsKUMrQ x1stdVZIj1YQwzTAjPPt3KebTDAy6TSdT81WO0niWUaeH998mxAIzvQNhJcStJXX x9BuIckUdG343Fx230RfaHkvH+klanbskUHH+QDEQQKBgQDM/J3BcCwoaHCllVtp hYPZtNiOFTSEmKj6OlQzI89iQI4meOKlmdaokgk0xZwR5933+/Yw2z1IaYFcWrVI 4Qk5dchy5GEKN6JUAHRTPnvvTqa6V1dzd/kvTH19pvVO12kGAXIFWPt/cYi5ZXrc LI/xuSe+r36ZEtWtaov7QJzNiQKBgQDAj5qxhT0H2FAGX0hOQl3SoBs3T4MH70qY vbH5Q1PQzTsJjSJlFkHl8AXw91LIHce7Ze7WiqoOLz2lg0qxZjxG0u3CAa/0ZlT/ ReM2mgZRvn84MsqQIQD+Xb+ImGfZ6Ukc30DubfLLaR5zoiYxyj+6lJXNs7aY0BnS UFMk9HVZpQKBgE3x4KqlVKUo0WylFlVRh4lI0u9z8LxasCY1975aZ4kcsvC+FrCR hqYioY2Hdoj4edbJ4BtDwlG+jInpk/VaXH+U4duOK7gO35LBeXoN0GJ2rb89Zutp Oz9Y/n7A9ZY9Ipo+AnU2GKulKDAW/liqOTHZDdvcL29VUhrW4NNxBi7BAoGABt9Z MwrBUd1bhc6ywvBFbvX94qx4zbixnd/vUSkg/avFdqLN3nO76Fv3qlD5aGD/tuV9 b7TFOvpepeCYstomPpTanXj38a4RTIcPA+zdWt+EpNnTNu+mnG12H4bo9fMIg/pH 0/qilrXqu0/HMzG3so4JBq1qT+vlcAcj4IbFBW0CgYA7lgQ7aNoEOXnBTjS5Nme3 b9ydgNyPN21ohSTZMJ6UmfSvoqpvEVQp6+VJyakzs4GDE1EJnj2wOSD+Qi4dm85c i7rZmx1yXaYMf3wE7qslK+BsFilEHaQDcIqfTZvX/dvkZF5FWJmNjUH9vjbaB7w6 oqeUgTerUr1gIoH4LR3BCg== '

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
