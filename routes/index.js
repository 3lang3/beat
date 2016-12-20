'use strict'

let express = require('express');
let router = express.Router();
let _G = require('./../base/global');
let fetchLoginSystem = require('./../class/C5login');

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res, nexxt) => {
  fetchLoginSystem((result) => {
    _G.cookie = result.cookie;
  });
})

router.get('/cookie', (req, res, nexxt) => {
  res.json(_G.cookie);
})

module.exports = router;
