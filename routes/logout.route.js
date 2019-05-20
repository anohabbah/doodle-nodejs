const router = require('express').Router();
const { authMiddleware } = require('../middlewares/auth.middleware');

router['use'](authMiddleware);

router['post']('/', (req, res) => {
  res.clearCookie('SESSIONID');
  res.sendStatus(200);
});

module.exports = router;
