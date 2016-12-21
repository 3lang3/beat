'use strict'

let express = require('express');
let superagent = require('superagent');
let cheerio = require('cheerio');
let router = express.Router();
let _G = require('./../base/global');
let fetchLoginSystem = require('./../class/C5login');
let PurchaseClass = require('./../class/Purchase');
let BuyClass = require('./../class/Buy');
let Common = require('./../base/common');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res, nexxt) => {
  fetchLoginSystem((result) => {
    global.cookie = result.cookie.join(';');
    res.json({status: 'success', cookie: global.cookie })
  });
})

router.get('/getProcessList', (req, res, next) => {
  res.json({
    buy: global.BuyHash,
    purchase: global.PurchaseHash
  })
})

router.post('/purchase', (req, res, next) => {
  global.PurchaseHash[req.body.id] = new PurchaseClass(req.body);
  global.PurchaseHash[req.body.id].init();
  res.json(global.PurchaseHash)
})

router.post('/purchaseCancel', (req, res, next) => {
  global.PurchaseHash[req.body.id].switch = true;
  delete global.PurchaseHash[req.body.id];

  res.json(global.PurchaseHash);
})

router.post('/buy', (req, res, next) => {
  global.BuyHash[req.body.id] = new BuyClass(req.body);
  global.BuyHash[req.body.id].init();

  res.json(global.BuyHash)
})

router.post('/buyCancel', (req, res, next) => {
  global.BuyHash[req.body.id].switch = true;
  delete global.BuyHash[req.body.id];

  res.json(global.BuyHash);
})


module.exports = router;
