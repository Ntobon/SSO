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
          path: '/adfs/callback',
          realm: 'urn:dev3:knomatic',
          identityProviderUrl: 'https://dc.knomatic.com/adfs/ls',
          thumbprint: '‎C2C561DDA76F69B0EA223C047A88113BF8CCD8CD'
        },
        AUTH_URL: 'https://dev-auth.knomatic.com',
        accountId : '00000000-0000-0000-0000-000000000000',
        redirectAfterAuth:{
          redirect:true,
          base64Token: true,
          web:'https://dev-web.knomatic.com/adfs/login/callback'
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
          path: '/adfs/callback',
          realm: 'urn:dev3:knomatic',
          identityProviderUrl: 'https://dc.knomatic.com/adfs/ls',
          thumbprint: '‎C2C561DDA76F69B0EA223C047A88113BF8CCD8CD',
        },
        AUTH_URL: 'https://dev-auth.knomatic.com',
        accountId:'00000000-0000-0000-0000-000000000000'
      }  
   break

}

const config = _.assign(constants, customizations)

module.exports = config
