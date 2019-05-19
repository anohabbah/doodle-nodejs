const util = require('util');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const PasswordValidator = require('password-validator');

const RSA_PRIVATE_KEY = fs.readFileSync(__dirname + './../config/private.key');
const RSA_PUBLIC_KEY = fs.readFileSync(__dirname + './../config/public.key');
const SESSION_DURATION = 240;

const signJWT = util.promisify(jwt.sign);

// Create a schema
const schema = new PasswordValidator();

// Add properties to it
schema
  .is().min(6) // Minimum length 6
  .has().uppercase() // Must have uppercase letters
  .has().lowercase() // Must have lowercase letters
  .has().digits() // Must have digits
  .has().not().spaces() // Should not have spaces
  .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

exports.validatePassword = password => {
  return schema.validate(password, { list: true });
};

exports.decodeJWT = async token => await jwt.verify(token, RSA_PUBLIC_KEY);

exports.createSessionToken = async user =>
  signJWT({}, RSA_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: SESSION_DURATION,
    subject: user.id.toString()
  });
