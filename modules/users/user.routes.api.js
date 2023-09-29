const router = require("express").Router();
// const jwtmiddleware = require("../../helpers/utils/jwt-middleware")
const Controller = require("./user.controller");
const authenticateToken = require("../../helpers/utils/jwt-middleware");

/** GET /api/users */
router.get('/', async (req, res, next) => {
    // console.log(req.file, req.files)
    console.log('******* i am here',)
    const whereClause = req.query && req.query.publicAddress ? { publicAddress: req.query.publicAddress }: undefined;
	await Controller.findUser(whereClause)
		.then((users) => res.json(users))
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
    .then((user) => res.json(user))
    .catch(err=>next(err))
  });

// router.get('/:userId', (req, res, next) => {
//     expressjwt(config)(req, res, (err) => {
//       if (err) {
//         console.error('JWT Error:', err.message);
//         return res.status(401).send({ error: 'Invalid token' });
//       }
  
//       console.log('Decoded User:', req.user);
//       next();
//     });
//   }, async (req, res, next) => {
//     // Rest of your code
//     await Controller.getById(req.params.userId)
//     .then((user) => res.json(user))
//     .catch(err=>next(err))
//   });

/** POST /api/users */
router.post('/', async (req, res, next) => {
    // console.log(req.file, req.files)
    Controller.addUser(req.body)
    .then((user) => res.json(user))
    .catch(next);
  });

/** PATCH /api/users/:userId */
/** Authenticated route */
router.put('/:userId',authenticateToken, async (req, res, next) => {
    // console.log(req.file, req.files)
    console.log(req.user.id, req.params.userId)
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

  module.exports = router;