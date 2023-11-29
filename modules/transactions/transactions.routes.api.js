const router = require("express").Router();
const Controller = require("./transactions.controller");
const authenticateToken = require("../../helpers/utils/jwt-middleware");


router.get('/', authenticateToken, async (req, res) => {
  const ownerAddress = req.user? req.user.publicAddress:'';
    try {
      const result = await Controller.getByOwner(ownerAddress);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;