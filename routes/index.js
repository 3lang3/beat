'use strict'

let express = require('express');
let superagent = require('superagent');
let cheerio = require('cheerio');
let router = express.Router();
let _G = require('./../base/global');
let fetchLoginSystem = require('./../class/C5login');
let searchSystem = require('./../class/Search');
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

router.post('/search', (req, res, nexxt) => {
  searchSystem(req.body.word, (list) => {
    res.json({list: list})
  })
})

router.get('/getTaskList', (req, res, next) => {
  res.json(global.TaskHash)
})

router.post('/generateTask', (req, res, next) => {
  Common.GenerateTask({
    option: req.body,
    callback: () => {
      console.log(2)
      res.json(global.TaskHash)
    }
  })
})

router.post('/cancelTask', (req, res, next) => {
  Common.CancelTask({
    task: req.body.task,
    callback: () => {
      res.json(global.TaskHash)
    }
  })
})


module.exports = router;
