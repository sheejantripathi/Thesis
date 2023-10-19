const router = require("express").Router();
// const jwtmiddleware = require("../../helpers/utils/jwt-middleware")
const Controller = require("./user.controller");
const authenticateToken = require("../../helpers/utils/jwt-middleware");

/** GET /api/users */
router.get('/', async (req, res, next) => {
    // console.log(req.file, req.files)
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

/** POST /api/users */
router.post('/', async (req, res, next) => {
    await Controller.addUser(req.body)
    .then((user) => res.json(user))
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

  module.exports = router;