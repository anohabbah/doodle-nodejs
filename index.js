require('dotenv').config();

const app = require('./app');

const port = normalizePort(process.env.PORT || '3000');
app.listen(port, () => console.log(`Server listening on port ${port}...`));

/**
 * Normalize a port into a number, string, or false.
 * @param {string} val Port string to normalize
 * @return {boolean|number|*}
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
