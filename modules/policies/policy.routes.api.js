const express = require('express');
const router = express.Router();

const Controller = require("./policy.controller");
// const { SecureAPI } = require("../../helpers/utils/secure");
// const { PM } = require("../../helpers");

router.get("/", (req, res, next) => {
  res.send('FUck yeah!!!!!!!!!!')
});

// API to add the custom policies
router.post('/add', async (req, res, next) => {
  console.log('dasdasdsads',req.body)
    // const { assetId, policyDetails } = req.body;
    Controller.addPolicy(req.body)
    .then((u) => res.json(u))
    .catch((error_msg) => next(error_msg));
});

module.exports = router;