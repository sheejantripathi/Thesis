const express = require('express');
const router = express.Router();

const { recoverPersonalSignature } = require('@metamask/eth-sig-util');
const { bufferToHex } = require('ethereumjs-util');
const jwt = require('jsonwebtoken');

const config = require('../../helpers/utils/config');
const User  = require('../users/user.model');


/** POST /api/auth */
router.post('/', async (req, res, next) => {
    
    const { signature, publicAddress } = req.body;
	if (!signature || !publicAddress)
		return res
			.status(400)
			.send({ error: 'Request should have signature and publicAddress' });

	await User.findOne({ publicAddress: publicAddress })
			.then((user) => {
				if (!user) {
					res.status(401).send({
						error: `User with publicAddress ${publicAddress} is not found in database`,
					});

					return null;
				}
                // console.log(user)
				return user;
			})
			.then((user) => {
				if (!(user instanceof User)) {
					throw new Error(
						'User is not defined in "Verify digital signature".'
					);
				}

				const msg = `I am signing my one-time nonce: ${user.nonce}`;
                // console.log(msg)
				const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'));
                // console.log(msgBufferHex,'22222222222222', signature)
				const recoveredAddress = recoverPersonalSignature({
					data: msgBufferHex,
					signature: signature,
				});

				if (recoveredAddress.toLowerCase() === publicAddress.toLowerCase()) {
					return user;
				} else {
					res.status(401).send({
						error: 'Signature verification failed',
					});

					return null;
				}
			})
			.then((user) => {
				if (!(user instanceof User)) {
					throw new Error(
						'User is not defined in "Generate a new nonce for the user".'
					);
				}

				user.nonce = Math.floor(Math.random() * 10000);
				return user.save();
			})
			.then((user) => {
				return new Promise((resolve, reject) =>
					jwt.sign(
						{
							payload: {
								id: user.id,
								publicAddress,
							},
						},
						config.secret,
						{
							algorithm: config.algorithms[0],
						},
						(err, token) => {
							if (err) {
								return reject(err);
							}
							if (!token) {
								return new Error('Empty token');
							}
							return resolve(token);
						}
					)
				);
			})
			.then((accessToken) => res.json({ accessToken }))
			.catch(next)

  });

  module.exports = router;