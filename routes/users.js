var express = require('express');
var router = express.Router();
var _G = require('./../base/global');

/* GET users listing. */
router.get('/', function(req, res, next) {

  console.log(_G.cookie)
  res.send('respond with a resource');
});

module.exports = router;
