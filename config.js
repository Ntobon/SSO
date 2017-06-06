var activeDirectoryConfig = {  
  url: 'ldap://dc.yourDCServer.com',
  baseDN: 'DC=YourDomain,DC=com',
  username: 'dcUser@YourDomain.com',
  password: 'dcUsersPassword'
};

var accountId = "Knomatic";
var port = "8002";


module.exports.activeDirectoryConfig = activeDirectoryConfig;
module.exports.accountId = accountId;
module.exports.port = port;
