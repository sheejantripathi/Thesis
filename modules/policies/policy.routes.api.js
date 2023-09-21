const express = require('express');
const router = express.Router();
const { Web3 } = require('web3');
const Controller = require("./policy.controller");
const multer = require('multer');

const providers = new Web3.providers.HttpProvider('http://127.00.1:9545');
var web3 = new Web3(providers)

const upload = multer({ dest: '../../uploads' });

// API to add the custom policies
router.post('/add', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  let payload = req.body;
  payload.filePath = req.file.path;

    await Controller.addPolicy(payload)
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
    console.log(result)
    const address = web3.utils.toChecksumAddress(result.address)
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;