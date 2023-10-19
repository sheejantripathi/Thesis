const router = require("express").Router();
const { Web3 } = require('web3');
const Controller = require("./policy.controller");
const authenticateToken = require("../../helpers/utils/jwt-middleware");
const config = require("./config");

const providers = new Web3.providers.HttpProvider('http://127.00.1:7545');
var web3 = new Web3(providers)

const multer = require("multer");
const policyController = require("./policy.controller");
const upload = multer({ dest: "uploads/" });

// API to add the custom policies
router.post('/add', authenticateToken, async (req, res, next) => {
  try {
    if (!req.files) {
      return res.status(400).send('No file uploaded.');
    }

    const payload = {
      ...req.body,
      contract_details: JSON.parse(req.body.contract_details),
      asset_owner: req.user.publicAddress
    };

    const fileToUpload = req.files.file0;

    const {policy_detail, asset_detail} = await Controller.addPolicy(payload, fileToUpload);

    await policyController.deployAttributeBasedContract(policy_detail, asset_detail,  req.user);
    res.send("Poilcy added and smart contract deployed")
    // res.json(registerUserDetails);
  } catch (error) {
    next(error);
  }
});

router.get('/get-contract', authenticateToken, async (req, res, next) => { 
  try {
    const childContractAddress = req.query? req.query.childContractAddress:'';
    await Controller.fetchContractDetails(childContractAddress, req.user);
  } catch (error) {
    next(error);
  }
});

router.get('/get-access', authenticateToken, async (req, res, next) => { 
  try {
    const childContractAddress = req.query? req.query.childContractAddress:'';
    const userAddress = req.user.publicAddress;
    const isUserAssociated = await policyController.isUserAssociatedWithContract(childContractAddress, userAddress);
    res.json(isUserAssociated);
  } catch (error) {
    console.log(error.message, 'error.message');
  }
});



router.post('/add-user-to-contract', authenticateToken, async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      user_contract_details: JSON.parse(req.body.user_contract_details),
    };

    const user_assigned_to_child_contract = await policyController.addUserToContract(payload.user_contract_details, req.user);
    // console.log(user_assigned_to_child_contract, 'user_assigned_to_child_contract');
    res.send("User successfully assigned to the contract")
    // res.json(registerUserDetails);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticateToken, async (req, res) => {
  console.log('$$$$$$$$$$$$$$$$$$$$$$', req.user)
  const policyID = req.query? req.query.policyID:'';
  try {
    const result = await Controller.getById(policyID);

    let registerUserDetails = await policyController.registerUserViaSmartContract(result, req.user)
    // let registerUserDetails = await policyController.checkReceiptStatus('0xaf532fee812c789b0ccc4787fc291e6c855b69c8e7c32c5e3567d9603135c441')

  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',registerUserDetails)
    // const address = web3.utils.toChecksumAddress(result.address)
    // res.json(registerUserDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  console.log('$$$$$$$$$$$$$$$$$$$$$$', req.user)
  const policyID = req.query? req.query.policyID:'';
  try {
    const result = await Controller.getById(policyID);

    let contractDetails = await policyController.deployAttributeBasedContract(result, req.user)
    // let registerUserDetails = await policyController.checkReceiptStatus('0xaf532fee812c789b0ccc4787fc291e6c855b69c8e7c32c5e3567d9603135c441')

  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',contractDetails)
  // Now i need to store the contract address and the asset Id in the database associating it with the owner of the asset
    // const address = web3.utils.toChecksumAddress(result.address)
    // res.json(registerUserDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;