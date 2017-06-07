var _ = require('lodash')

var env = process.env.NODE_ENV || 'local';

var ADFS_XML_SCHEMA_MAPPINGS = [
  {
    claim: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    user_key:'mail'
  },
  {
    claim: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
    user_key:'givenName'
  },
  {
    claim: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
    user_key:'sn'
  },
  {
    claim: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/primarygroupsid',
    user_key:'groups'
  },
  {
    claim: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
    user_key:'userPrincipalName'
  }
]



var constants = {
  PORT: "8002",
  NODE_ENV: env,
  ADFS_XML_SCHEMA_MAPPINGS
};

var customizations = {};

switch(env){
  case 'development':
      //add credentials after making the repo private
      customizations = {
        activeDirectoryConfig: {  
          url: 'ldap://dc.yourDCServer.com',
          baseDN: 'DC=YourDomain,DC=com',
          username: 'dcUser@YourDomain.com',
          password: 'dcUsersPassword'
        }, 
        wsfedsaml2: {   ///ADFS trusted relying party options
          path: '{url-callback}',
          realm: '{your-adfs-realm}', // urn:your:domain
          identityProviderUrl: '{your-adfs-domain}', //https://dc.domain.com/adfs/ls
          thumbprint: '‎{thumbprint}' // C2C561...D8CD
        },
        AUTH_URL: '{local-url}', //https://your.domain.com
        accountId : '00000000-0000-0000-0000-000000000000',
        redirectAfterAuth:{
          redirect:true,
          base64Token: true, // base 64 token response
          web:'{call-back-url}' // callback url with roken
        }
      }
    break
  default:
      customizations = {
        activeDirectoryConfig: {  
          url: 'ldap://dc.yourDCServer.com',
          baseDN: 'DC=YourDomain,DC=com',
          username: 'dcUser@YourDomain.com',
          password: 'dcUsersPassword'
        }, 
        wsfedsaml2: {   ///ADFS trusted relying party options
          path: '{url-callback}',
          realm: '{your-adfs-realm}', // urn:your:domain
          identityProviderUrl: '{your-adfs-domain}', //https://dc.domain.com/adfs/ls
          thumbprint: '‎{thumbprint}' // C2C561...D8CD
        },
        AUTH_URL: '{local-url}', //https://your.domain.com
        accountId : '00000000-0000-0000-0000-000000000000',
        redirectAfterAuth:{
          redirect:true,
          base64Token: true, // base 64 token response
          web:'{call-back-url}' // callback url with roken
        }
      }
   break

}

const config = _.assign(constants, customizations)

module.exports = config
