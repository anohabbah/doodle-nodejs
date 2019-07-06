const router = require('express').Router();
const _ = require('lodash');

module.exports = ({ User }) => {
  router.get('', async (req, res) => {
    const userInfo = parseInt(req['user'], 10);

    if (userInfo) {
      const user = await User.findByPk(userInfo);

      res.status(200).json(_.pick(user, ['id', 'email', 'name']));
    } else res.sendStatus(204);
  });

  return router;
};
