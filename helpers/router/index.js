/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const router = require('express').Router();
const pkg = require('../../package.json');
// const { PM } = require('../index');

// const { SecureUI } = require('../utils/secure');
// eslint-disable-next-line camelcase
const { api_v1, ui } = require('./routes.json');

router.use(async (req, res, next) => {
  const commonData = {
    app: { version: pkg.version.replace(/\./g, '-') },
  };

  res.renderWithData = async (view, data = {}) => {
    const resData = Object.assign(data, commonData);
    res.render(view, resData);
  };
  next();
});

// enables Passport Logins
// if (config.has('app.social')) {
//   if (config.get('app.social')) {
//     require('../utils/passport');
//   }
// }

// Get home page
router.get('/',  (req, res) => {
  res.renderWithData('index', { title: 'LSCMS Dashboard' });
});

// router.get('/settings', SecureUI(PM.ADMIN), (req, res) => {
//   res.render('misc/settings', { title: 'Settings' });
// });

// router.get('/unauthorized', (req, res) => {
//   res.render('misc/unauthorized', { title: 'Unauthorized Access' });
// });

// router.get('/scan', (req, res) => {
//   res.render('scan', { title: 'Scan QR' });
// });

// router.get('/becomeRetailer', (req, res) => {
//   res.render('retailer', { title: 'Become Retailer' });
// });


Object.keys(api_v1).forEach((key) => {
  router.use(`/api/v1/${key}`, require(api_v1[key]));
});

Object.keys(ui).forEach((key) => {
  router.use(`/${key}`, require(ui[key]));
});

module.exports = router;
