const util = require('util');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const RSA_PRIVATE_KEY = fs.readFileSync(__dirname + './../config/private.key');
const RSA_PUBLIC_KEY = fs.readFileSync(__dirname + './../config/public.key');
const SESSION_DURATION = 240;

const signJWT = util.promisify(jwt.sign);

exports.createSessionToken = async user =>
  signJWT({}, RSA_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: SESSION_DURATION,
    subject: user.id.toString()
  });

exports.decodeJWT = async token => await jwt.verify(token, RSA_PUBLIC_KEY);
