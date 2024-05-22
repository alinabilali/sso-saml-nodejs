const fs = require('fs');

module.exports = {
  passport: {
    strategy: 'saml',
    saml: {
      path: 'https://your-web-urlcom/login/callback',
      entryPoint:
        process.env.SAML_ENTRY_POINT ||
        'https://sso.jumpcloud.com/saml2/{systemname}',
      issuer: 'passport-saml',
      cert: fs.readFileSync('your-jumpcloud-sso-certrificate.cer', 'utf-8'),
    },
  },
};
