const jwt = require('express-jwt');

// eslint-disable-next-line prettier/prettier
const getTokenFromHeaders = (req) => {
  // eslint-disable-next-line prettier/prettier
  const { headers: { authorization } } = req;

  if (authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  return null;
};

const auth = {
  required: jwt({
    secret: 'secret',
    userProperty: 'payload',
    getToken: getTokenFromHeaders
  }),
  optional: jwt({
    secret: 'secret',
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
    credentialsRequired: false
  }),
  checkToken: (req, res, next) => {
    if (!req.session.user) {
      console.log('checkToken', req.session.user);
      next({ message: 'Not logged in', status: 405 });
    } else {
      next();
    }
  }
};

module.exports = auth;
