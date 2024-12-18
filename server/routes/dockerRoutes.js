const express = require('express');
const router = express.Router();
const dockerController = require('../controllers/dockerController');

router.get('/startAllHellasteeze', (req, res) => {
  dockerController.startAllHellasteeze();
});

router.get('/updateCookies', () => {
  dockerController.runCookieMonster();
})

module.exports = router;