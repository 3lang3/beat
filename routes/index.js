'use strict'

let express = require('express');
let superagent = require('superagent');
let cheerio = require('cheerio');
let router = express.Router();
let _G = require('./../base/base.config');
let fetchLoginSystem = require('./../class/C5login');
let searchSystem = require('./../class/Search');
let PurchaseSale = require('./../class/Sale');
let DataClass = require('./../class/Data');
let Common = require('./../base/event');
let Task = require('./../base/task');
let async = require('async');
let SendMail = require('./../class/Mail');


let timer =  setInterval(()=> {
      SendMail({title: 'App is active!', html: 'test text'});
}, 2 * 60 * 60 * 1000)
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
  searchSystem(req.body.word, (err, list) => {
    res.json({list: list})
  })
})

router.get('/getTaskList', (req, res, next) => {
  res.json(global.TaskHash)
})

router.post('/generateTask', (req, res, next) => {
  Task.generate({
    option: req.body,
    callback: () => {
      res.json(global.TaskHash)
    }
  })
})

router.post('/cancelTask', (req, res, next) => {
  Task.cancel({
    task: req.body.task,
    callback: () => {
      res.json(global.TaskHash)
    }
  })
})

router.get('/purchaseSale', (req, res, next) => {
  if(!global.PurchaseSale) {
    global.PurchaseSale = new PurchaseSale();
    global.PurchaseSale.init();

    res.json({status: 'success'})
  }else {
    global.PurchaseSale.switch = true;
    delete global.PurchaseSale;

    res.json({status: 'success'})
  }
})

router.get('/getSearchForm', (req, res, next) => {
  async.waterfall([
    getFilterGroup
  ], (err, result) => {
    res.json(result)
  })
})

router.post('/getTypeSearch', (req, res, next) => {
  let O = new DataClass(req.body['lists']);
  O.flow(() => {
    res.json({status: 'success'})
  });
})

function getFilterGroup(callback) {
  Common.fetchGet({
    url: _G.C5.dotaUrl,
    callback: (data) => {
      let $ = cheerio.load(data.text);
      let $groups = $('.filter-cat-group');
      let _groupJson = [];

      $groups.each((i, group) => {
        let _title = $(group).find('.filter-cat-title').text().match(/[\u4e00-\u9fa5]+/g)[0],
          _name = $(group).find('a').eq(1).attr('href').split('html?')[1].split('=')[0],
          _list = [];

        $(group).find('a').each((j, a) => {
          if (j == 0) return;
          _list.push({
            text: (i > 3) ? $(a).attr('title') : $(a).text(),
            value: $(a).attr('href').split('=')[1].split('&')[0],
            type: _name
          })
        })
        _groupJson.push({
          title: _title,
          name: _name,
          list: _list
        })
      })

      callback && callback(null, _groupJson)
    }
  })
}

module.exports = router;
