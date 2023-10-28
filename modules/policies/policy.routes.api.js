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
    // if (!req.files) {
    //   return res.status(400).send('No file uploaded.');
    // }

    const payload = {
      ...req.body,
      contract_details: JSON.parse(req.body.contract_details),
      asset_owner: req.user.publicAddress
    };

    let deployedContractResults = await policyController.deployAttributeBasedContract(payload);
    res.send({message: 'Policy added Successfully', success: true});
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



router.post('/add-users-to-group', authenticateToken, async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      user_contract_details: JSON.parse(req.body.user_contract_details),
    };

    const user_assigned_to_child_contract = await policyController.addUsersToGroup(payload.user_contract_details, req.user);
    // console.log(user_assigned_to_child_contract, 'user_assigned_to_child_contract');
    res.send("Users successfully assigned to the group")
    // res.json(registerUserDetails);
  } catch (error) {
    next(error);
  }
});

router.get('/pinata-test',  async (req, res, next) => { 
  try {
    // const childContractAddress = req.query? req.query.childContractAddress:'';
  await Controller.pinataTest()
  .then((result) => {  console.log(result, 'result')})
  .catch((err) => { console.log(err, 'err')})
  } catch (error) {
    next(error);
  }
});

module.exports = router;