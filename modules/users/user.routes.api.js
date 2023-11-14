const router = require("express").Router();
// const jwtmiddleware = require("../../helpers/utils/jwt-middleware")
const Controller = require("./user.controller");
const authenticateToken = require("../../helpers/utils/jwt-middleware");
const instanceController = require('../contractInstances/instances.controller');
const crypto = require('crypto');
const NodeRSA = require('node-rsa');



/** GET /api/users */
router.get('/', async (req, res, next) => {
    // console.log(req.file, req.files)
    const whereClause = req.query && req.query.publicAddress ? { publicAddress: req.query.publicAddress }: undefined;
	await Controller.findUser(whereClause)
		.then((users) => res.json(users))
		.catch(next);
  });

  router.get('/groups', authenticateToken, async (req, res, next) => {
    // console.log(req.file, req.files)
    const whereClause = req.user && req.user.publicAddress ? { publicAddress: req.user.publicAddress }: undefined;
    // const childContractInstance = await instanceController.createChildContractInstance(groupContractAddress);
    const groupDetailsOfUser = await instanceController.getuserGroupDetials(req.user.publicAddress);
    const transformedData = groupDetailsOfUser.map(group => {
      return {
        name: group.groupName,
        contractAddress: group.groupContractAddress
      };
    });
    res.json(transformedData)
	  // await Controller.findUser(whereClause)
		// .then((users) => res.json(users))
		// .catch(next);
  });

  router.get('/uploadedFiles', authenticateToken, async (req, res, next) => {
    // console.log(req.file, req.files)
    const whereClause = req.user && req.user.publicAddress ?  req.user.publicAddress : undefined;
	await instanceController.getFilesAssociatedWithUser(whereClause)
		.then((files) => res.json(files))
		.catch(next);
  });
 
router.get('/:userId', authenticateToken, async (req, res, next) => {

    if (req.user.id !== req.params.userId) {
        return res
            .status(401)
            .send({ error: 'You can can only access yourself' });
    }

    await Controller.getById(req.params.userId)
    .then((user) => {
        res.json(user)
    })
    .catch(err=>next(err))
  });

/** POST /api/users */
router.post('/', async (req, res, next) => {
    await Controller.addUser(req.body)
    .then((user) => res.json(user))
    .catch((err)=> console.log(err));
  });

/** POST /api/users/asset-upload */
router.post('/asset-upload',authenticateToken, async (req, res, next) => {
  if (!req.files) {
    return res.status(400).send('No files uploaded.');
  }
  
  const asset_owner = req.user.publicAddress;
  const filesToUpload = Object.values(req.files);
  
  console.log(filesToUpload, 'filesToUpload')
  return
  try {
    const uploadedFiles = await instanceController.encryptStreamAndUploadToIPFS(filesToUpload, asset_owner);
  
    for (file of uploadedFiles) {
      const user = await Controller.findUser({ publicAddress: asset_owner });
  
      const encryptedSymmetricKey = crypto.publicEncrypt(
        {
          key: user.publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        Buffer.from(file.key)
      );

      const encryptedSymmetricIV = crypto.publicEncrypt(
        {
          key: user.publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(file.iv)
      );
 
      console.log(file, 'file')
      const factoryContractInstance = await instanceController.createPolicyContractInstance();
      // console.log(encryptedSymmetricKey, 'encryptedSymmetricKey')
      // console.log(encryptedSymmetricIV, 'encryptedSymmetricIV')

      // return
      // Convert hexadecimal strings to bytes
      const encryptedSymmetricKeyHex = '0x' + encryptedSymmetricKey.toString('hex');
      const encryptedSymmetricIVHex = '0x' + encryptedSymmetricIV.toString('hex');
      const fileContractResult = await factoryContractInstance.methods.createFileContract(file.fileName, file.IpfsHash, 
        encryptedSymmetricKeyHex, encryptedSymmetricIVHex).send({ from: asset_owner, gas: 3000000 });
  
      const updatedUser = await Controller.associateFilesToOwner({
        eoaAddress: asset_owner,
        contractAddress: fileContractResult.to,
        fileName: file.name
      });
      console.log(updatedUser, 'updatedUser')
      res.json(updatedUser);
    }
  } catch (error) {
    // Handle any caught errors
    console.error('Error occurred:', error);
    return res.status(500).send('Internal Server Error');
  }
  

    // const decryptedsymmetricKey = crypto.privateDecrypt(
      //   {
      //     key: user.privateKey,
      //     // In order to decrypt the data, we need to specify the
      //     // same hashing function and padding scheme that we used to
      //     // encrypt the data in the previous step
      //     passphrase: 'top secret',
      //     padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      //     oaepHash: "sha256",
      //   },
      //   encryptedSymmetricKey
      // )
      
      // The decrypted data is of the Buffer type, which we can convert to a
      // string to reveal the original data
      // console.log("decrypted data: ", decryptedsymmetricKey.toString())
    // .then((uploadedFiles) => res.json(uploadedFiles))
    // .catch((err)=> console.log(err));
  });

/** POST /api/usere/asset-uplaod-test*/

router.post('/asset-upload-test',authenticateToken, async (req, res, next) => {
  if (!req.files) {
      return res.status(400).send('No files uploaded.');
    }
  
  const asset_owner = req.user.publicAddress

  const filesToUpload = [].concat(...Object.values(req.files));

  await instanceController.uploadFileToIPFS(filesToUpload, asset_owner);
  res.json({message: 'Files successfully uploaded to IPFS', success: true});
  // const factoryContractInstance = await instanceController.createPolicyContractInstance();
  // let updatedUsersList = [];
  // for (file of ipfsUploadResults) {
  //   const fileContractResult = await factoryContractInstance.methods.createFileContract(file.fileName, file.IpfsHash).send({ from: asset_owner, gas: 3000000 });
  
  //   const updatedUser = await Controller.associateFilesToOwner({
  //     eoaAddress: asset_owner,
  //     contractAddress: fileContractResult.to,
  //     fileName: file.name
  //   });
  //   updatedUsersList.push(updatedUser);
  // }

  // res.json(updatedUsersList);
});


/** POST /api/users/asset-download */
router.post('/asset-download',authenticateToken, async (req, res, next) => {
    if (!req.files) {
        return res.status(400).send('No files uploaded.');
      }
    
    const asset_owner = req.user.publicAddress
    await instanceController.downloadFileFromIPFS(filesToUpload, asset_owner)
    .then((uploadedFiles) => res.json(uploadedFiles))
    .catch((err)=> console.log(err));
  });
/** PATCH /api/users/:userId */
/** Authenticated route */
router.put('/:userId',authenticateToken, async (req, res, next) => {
    if (req.user.id !== req.params.userId) {
        return res
            .status(401)
            .send({ error: 'You can can only access yourself' });
    }
    
    await Controller.updateUser(req.user, req.body)
        .then((user) => {
            if (!user) {
                console.log('Such user does not exist')
                return
            }

            return user
        })
        .then((user) => {
            return user
                ? res.json(user)
                : res.status(401).send({
                        error: `User with publicAddress ${req.params.userId} is not found in database`,
                  });
        })
        .catch(next);
  });

  router.get('/group/files', authenticateToken, async (req, res, next) => {
    const userPublicAddress = req.user && req.user.publicAddress ? req.user.publicAddress : '';
    const groupContractAddress = req.query ? req.query.groupContractAddress: '';
    const childContractInstance = await instanceController.createChildContractInstance(groupContractAddress);
    const isUserAssociatedWithContract = await childContractInstance.methods.getUserAccessInfo(userPublicAddress).call();
    const currentTime = Math.floor(Date.now() / 1000); // Get current Unix timestamp

    console.log(isUserAssociatedWithContract, 'isUserAssociatedWithContract')
    // Assuming you have received accessFrom and accessTo timestamps from the smart contract
    const userAccessFrom = isUserAssociatedWithContract['0'];
    const userAccessTo = isUserAssociatedWithContract['1'];
    
    if(isUserAssociatedWithContract['2'] === true && (currentTime>=userAccessFrom && currentTime<=userAccessTo)){
      const filesInGroup = await childContractInstance.methods.getAddedFileDetails().call();
        const formattedData = filesInGroup.map((item) => {
            return {
              IPFSHash: item[0],
              name: item[1],
            };
          });
        res.json({formattedData:formattedData, message: 'Files successfully fetched from the group'});
    }
    else{
      return res
      .status(401)
      .send({ message: 'User is not authorized to access the group' });
    }
  });

/** GET /api/users/get-metadata */
router.get('/metadata-details',authenticateToken, async (req, res, next) => {
  
  console.log(req.query, 'req.query')
  return
  await instanceController.downloadFileFromIPFS(filesToUpload, asset_owner)
  .then((uploadedFiles) => res.json(uploadedFiles))
  .catch((err)=> console.log(err));
});
  module.exports = router;