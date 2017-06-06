var ActiveDirectory = require('activedirectory');
var config = require("../config");

var ad = new ActiveDirectory(config.activeDirectoryConfig);

module.exports.authenticate = function (username, password) {
  return new Promise((resolve, reject) => {
    ad.authenticate(username, password, function (err, isAuth) {
      if (err) {
        return reject(err);
      }

      if (!isAuth) {
        return reject("Invalid Password");
      }
      return resolve();
    });
  });
};

module.exports.findUser = function (username) {
  return new Promise((resolve, reject) => {
    ad.findUser(username, function (err, user) {
      if (err) {
        return reject(err);
      }
      if (!user) {
        return reject("User " + username + " not found.");
      }
      return resolve(user);
    });
  });
};


module.exports.getGroups = function (username) {
  return new Promise((resolve, reject) => {
    ad.getGroupMembershipForUser(username, function (err, groups) {
      if (err) {
        return reject(err);
      }
      if (!groups) {
        return reject("User " + username + " not found.");
      }
      return resolve(groups);
    });
  });
};