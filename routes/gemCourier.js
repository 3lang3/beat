'use strict';

var express = require('express');
var router = express.Router();
var GemCourier = require('./../model/GemCourier');
var classGemCourier = require('./../class/GemCourier');
var async = require('async');
var cheerio = require('cheerio');
var superagent = require('superagent');
var Common = require('./../base/event');
var _G = require('./../base/base.config');
var _ = require('lodash');

router.post('/', (req, res, next) => {
    let list = req.body;

    GemCourier.update({id: list.id}, { $set: list}, (err, docs) => {
        res.json({status: 'success', data: docs});
    })
})

router.get('/', (req, res, next) => {
    GemCourier.find((err, doc) => {
        if(err) res.json(err);
        if(doc.length == 0) {
            let newGem = new classGemCourier('gem');
            let newCourier = new classGemCourier('courier');
            async.parallel([
                (c) => {
                    newGem.flow(c);
                },
                (c) => {
                    newCourier.flow(c);
                }
            ], (err, result) => {
                GemCourier.insertMany(_.flatten(result), (err, docs) => {
                    console.log(docs);
                    res.json({status: 'success', data: docs })
                })
            })
        }else {
            res.json({status: 'success', data: doc })
        }
    })
})



module.exports = router;