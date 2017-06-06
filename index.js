var Hapi = require('hapi');
var fs = require('fs');
var NodeRSA = require('node-rsa');
var ad = require("./lib/ActiveDirectoryPromise.js");
var Joi = require("joi");
var Boom = require("boom");
var config = require("./config");
var wsfedsaml2 = require('passport-wsfed-saml2').Strategy
var util = require('util')
var server = new Hapi.Server();
var _ = require('lodash')

///getting passport with wsfed strategy initialized
var passport = require('./lib/passport.js')

const serverConfig = {
  port: config.PORT,
  routes: { cors: true }
}

console.log(config)

server.connection(serverConfig);


const swaggerOptions = {
  info: {
    'title': 'Knomatic Remote Auth Service',
    'version': "1.0"
  },
  'schemes':['https'],
  'host':'auth.knomatic.com'
};

const goodOptions = {
  ops: {
    interval: 1000
  },
  reporters: {
    myConsoleReporter: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{
        log: '*',
        response: '*'
      }]
    }, {
      module: 'good-console'
    }, 'stdout'],
  }
};


server.register([
  require('inert'),
  require('vision'),
  {
    'register': require('hapi-swagger'),
    'options': swaggerOptions
  },
  {
    register: require('good'),
    'options': goodOptions,
  },
], (err) => {
  server.key = new NodeRSA();

  fs.readFile('./private.key', 'utf8', function (err, data) {
    server.key.importKey(data);
  });

  server.start((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Server running at:', server.info.uri);
    }
  });
});

server.route({
  method: 'POST',
  path: '/',
  config: {
    tags: ['api'],
    validate: {
      payload: {
        username: Joi.string().required(),
        password: Joi.string().required(),
      }
    }
  },
  handler: function (request, reply) {
    var adGroups = [];

    ad.authenticate(request.payload.username, request.payload.password)
      .then(function () {
        return ad.getGroups(request.payload.username);
      })
      .then(function (groups) {
        adGroups = groups;
      })
      .then(function () {
        return ad.findUser(request.payload.username);
      })
      .then(function (userObj) {

        var e = server.key.encryptPrivate({
          id: request.payload.username,
          adUser: userObj,
          adGroups: adGroups
        });

        return reply({
          accountId: config.accountId,
          data: e.toString('base64')
        });

      })
      .catch(function (err) {
        console.log("Login Error:" + err);
        return reply(Boom.unauthorized());
      });
  }
});


server.route({
  method: 'POST',
  path: '/adfs/callback',
  config: {
    tags: ['api']
  },
  handler: function (request, reply) {

    var prototype = passport._strategy('wsfed-saml2');
    var strategy = Object.create(prototype);

    strategy.redirect = function (url) {
        console.log('redirecting')
        reply().redirect('/');
    };
    strategy.fail = function (warning) {
      console.log(warning)
        reply('Unable to complete the authentication').code(500)
    };
    strategy.error = function (error) {
      console.log('error', error)
       reply(error)
    };
    strategy.success = function (user, info) {
      console.log('sucess', user , info)
      if (!user){
        reply('Unable to get user data from ADFS server').code(400)
      }
      let ADFS_XML_SCHEMA_MAPPINGS = config.ADFS_XML_SCHEMA_MAPPINGS

      let knomaticUserSchema = {}
      _.forOwn(user, (value, key)=>{
          let map = _.find(ADFS_XML_SCHEMA_MAPPINGS, {claim: key}) || {user_key:false}
         // console.log(ADFS_XML_SCHEMA_MAPPINGS)
//          console.log('key',key)
//          console.log('value', value)
          if ( map.user_key  && value){
//            console.log(map)
            knomaticUserSchema[map.user_key] = value
          } else if(value) {
            knomaticUserSchema[key] = value
          }
          if (map.user_key === 'groups' && value) {
            knomaticUserSchema['adGroups'] = value
          }
      })
      console.log('user_data' , knomaticUserSchema)
      var e = server.key.encryptPrivate(knomaticUserSchema);
      var token = {
          accountId: config.accountId,
          data: e.toString('base64')
      }
      reply(token)
    };


    strategy.authenticate({
        query: request.query,
        method: 'POST',
        body: request.body || request.payload,
        session: request.session
    }, {});

  }
});



server.route({
  method: 'GET',
  path: '/adfs/login',
  config: {
    tags: ['api'],
    auth: false
  },
  handler: function (request, reply) {
    var prototype = passport._strategy('wsfed-saml2');
    var strategy = Object.create(prototype);
    strategy.redirect = function (url) {
        reply().redirect(url);
    };

    strategy.authenticate({
        query: request.query,
        body: request.body || request.payload,
        session: request.session
    }, {});
  }
});


