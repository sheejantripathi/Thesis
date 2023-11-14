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
    const payload = {
      ...req.body,
      policies: JSON.parse(req.body.policies),
      group_owner: req.user.publicAddress
    };

    await policyController.deployAttributeBasedContract(payload);
    
    res.send({success:true, message: "Policy successfully added"})
  } catch (error) {
    next(error);
  }
});

router.get('/get-contract-details', authenticateToken, async (req, res, next) => { 
  try {
    const childContractAddress = req.query? req.query.childContractAddress:'';
    const fetched_contract_details = await Controller.fetchContractDetails(childContractAddress, req.user.publicAddress);
    const contract_details = {
      groupName: fetched_contract_details.groupName,
      permissions: fetched_contract_details.permissions,
      ownerAddress: fetched_contract_details.groupOwnerAddress,
      contractAddress: childContractAddress,
      countries: fetched_contract_details.countries,
      organizations: fetched_contract_details.organizations,
    };
    res.json(contract_details);
  } catch (error) {
    next(error);
  }
});

// router.get('/get-contract-list', authenticateToken, async (req, res, next) => { 
//   try {
//     // const childContractAddress = req.query? req.query.childContractAddress:'';
//     await Controller.getDeployedContractAddresses(req.user.publicAddress);
//   } catch (error) {
//     next(error);
//   }
// });


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

    const user_assigned_to_child_contract = await policyController.addUsersToGroup(payload.user_contract_details, req.user.publicAddress);

    // console.log(user_assigned_to_child_contract, 'user_assigned_to_child_contract');
    res.send({success:true, message: "Users successfully added to the group"})
    // res.json(registerUserDetails);
  } catch (error) {
    next(error);
  }
});


router.post('/add-files-to-group', authenticateToken, async (req, res, next) => {
  try {
    const groupContractAddress = req.query? req.query.groupContractAddress:'';
    const userAddress = req.user? req.user.publicAddress : '';
    const filesToAddInGroupContract = [...req.body];

    const user_assigned_to_child_contract = await policyController.addFilesToGroupContract(filesToAddInGroupContract, groupContractAddress, userAddress);
    // console.log(user_assigned_to_child_contract, 'user_assigned_to_child_contract');
    res.send("Files successfully shared within the group")
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

router.post('/asset-upload',authenticateToken, async (req, res, next) => {
  if (!req.files) {
      return res.status(400).send('No files uploaded.');
    }
  
  const asset_owner = req.user.publicAddress
  const filesToUpload = Object.values(req.files);
  await Controller.heliaFileUploader(filesToUpload, asset_owner)
  .then((uploadedFiles) => res.json(uploadedFiles))
  .catch((err)=> console.log(err));
});
module.exports = router;