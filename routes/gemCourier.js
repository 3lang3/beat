'use strict';

var express = require('express');
var router = express.Router();
var GemCourier = require('./../model/GemCourier');
var async = require('async');
var cheerio = require('cheerio');
var superagent = require('superagent');
var Common = require('./../base/common');
var _G = require('./../base/base.config');

router.post('/', (req, res, next) => {
    let saveAry = JSON.parse(req.body['lists']);

    GemCourier.insert(saveAry, (err, docs) => {
        console.log(docs);
        res.json({status: 'success', data: docs});
    })
})

router.get('/', (req, res, next) => {

    Fish.find((err, doc) => {
        if (err) res.json(err);
        res.json({ status: 'success', list: doc })
    })
})

router.delete('/', (req, res, next) => {
    Fish.remove({ id: req.body.id }, (err, doc) => {
        if (err) res.json(err);
        res.json({ status: 'success', list: doc })
    })
})

router.put('/', (req, res, next) => {
    Fish.update({ 'option.id': req.body.id }, { $set: {
        'option.type': req.body['type'],
        'option.price': req.body['price'],
        'option.detail': req.body['detail']
    }}, (err, doc) => {
        if (err) res.json(err);
        res.json({ status: 'success', list: doc })
    })
})

module.exports = router;