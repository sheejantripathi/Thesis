const router = require("express").Router();
const { Web3 } = require('web3');
const Controller = require("./transactions.controller");
const authenticateToken = require("../../helpers/utils/jwt-middleware");
// const config = require("./config");

const providers = new Web3.providers.HttpProvider('http://127.00.1:7545');
var web3 = new Web3(providers)


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