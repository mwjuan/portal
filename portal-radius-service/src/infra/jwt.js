const jwt = require('jsonwebtoken');
const config = require('config');
const moment = require('moment');

class JWT {
  sign(payload, duration = '1d') {
    const token = jwt.sign(payload, config.sercurity.jwtSecret, { expiresIn: duration });
    return token;
  }

  decode(token) {
    const decoded = jwt.verify(token, config.sercurity.jwtSecret);

    if (!(decoded.exp || decoded.exp > moment().unix())) {
      throw Error('jwt expired');
    }
    return decoded;
  }

  exp(token) {
    return jwt.verify(token, config.security.jwtSecret).exp;
  }
}

module.exports = new JWT();