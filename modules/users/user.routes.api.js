const router = require("express").Router();
// const jwtmiddleware = require("../../helpers/utils/jwt-middleware")
const Controller = require("./user.controller");
const authenticateToken = require("../../helpers/utils/jwt-middleware");
const instanceController = require('../contractInstances/instances.controller');


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
	await Controller.findUser(whereClause)
		.then((users) => res.json(users))
		.catch(next);
  });

  router.get('/uploadedFiles', authenticateToken, async (req, res, next) => {
    // console.log(req.file, req.files)
    const whereClause = req.user && req.user.publicAddress ?  req.user.publicAddress : undefined;
	await instanceController.getFilesAssociatedWithUser(whereClause)
		.then((files) => res.json(files))
		.catch(next);
  });
 
router.get('/:userId', authenticateToken, async (req, res, next) => {
    // console.log(req.file, req.files)
    console.log(req.user);

    if (req.user.id !== req.params.userId) {
        return res
            .status(401)
            .send({ error: 'You can can only access yourself' });
    }

    await Controller.getById(req.params.userId)
    .then((user) => {
        console.log(user, 'user')
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
    
    const asset_owner = req.user.publicAddress
    const filesToUpload = Object.values(req.files);
    await instanceController.uploadFileToIPFS(filesToUpload, asset_owner)
    .then((uploadedFiles) => res.json(uploadedFiles))
    .catch((err)=> console.log(err));
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
    // console.log(req.params.id)
    await Controller.updateUser(req.params.userId, req.body)
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
    // console.log(req.file, req.files)
    console.log(req.user, 'req.user');
    const userPublicAddress = req.user && req.user.publicAddress ? req.user.publicAddress : '';
    const groupContractAddress = req.query ? req.query.groupContractAddress: '';
    const childContractInstance = await instanceController.createChildContractInstance(groupContractAddress);
    const isUserAssociatedWithContract = await childContractInstance.methods.isUserAssociated(userPublicAddress).call();
    console.log(isUserAssociatedWithContract, 'isUser')
    if (isUserAssociatedWithContract !== true) {
        return res
            .status(401)
            .send({ error: 'User is not associated with the group' });
    }
    else{
        const filesInGroup = await childContractInstance.methods.getAddedFileDetails().call();
        const formattedData = filesInGroup.map((item) => {
            return {
              IPFSHash: item[0],
              name: item[1],
            };
          });
          console.log(formattedData, 'formattedData')
        res.json(formattedData);
    }
  });


  module.exports = router;