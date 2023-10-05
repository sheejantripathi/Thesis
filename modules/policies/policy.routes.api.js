const router = require("express").Router();
const { Web3 } = require('web3');
const Controller = require("./policy.controller");
const authenticateToken = require("../../helpers/utils/jwt-middleware");
const config = require("./config");

const providers = new Web3.providers.HttpProvider('http://127.00.1:8545');
var web3 = new Web3(providers)

const multer = require("multer");
const policyController = require("./policy.controller");
const upload = multer({ dest: "uploads/" });

// API to add the custom policies
router.post('/add', authenticateToken, async (req, res, next) => {
  // console.log(req.file, req.files)
  if (!req.files) {
    return res.status(400).send('No file uploaded.');
  }

  let payload = req.body;
  payload.requester_attributes = JSON.parse(payload.requester_attributes)
  payload.asset_owner = req.user.id
  const fileToUpload = req.files.file0;
  const fileContent = fileToUpload.data;
  
    await Controller.addPolicy(payload, fileContent)
    .then((u) => res.json(u))
    .catch((error_msg) => next(error_msg));
});

router.get('/', async (req, res) => {
  web3.eth.getAccounts().then((result) => {
    console.log("Latest Ethereum Block is ",result);
  });

  
  
  const policyID = req.query? req.query.policyID:'';
  try {
    const result = await Controller.getById(policyID);
    // console.log(result)
    let registerUserDetails = await policyController.registerUserViaSmartContract(result)
  // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',registerUserDetails)
    // const address = web3.utils.toChecksumAddress(result.address)
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;