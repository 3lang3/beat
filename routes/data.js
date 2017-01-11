'use strict';

var express = require('express');
var router = express.Router();
var DataClass = require('./../class/Data');
var Item = require('./../model/Item');
var async = require('async');
var cheerio = require('cheerio');
var Common = require('./../base/event');
var _G = require('./../base/base.config');

router.post('/', (req, res, next) => {
    async.waterfall([
        (c) => {
            let NewData = new DataClass(req.body['lists']);
            NewData.flow(c)
        }
    ], (err, result) => {
        Item.insertMany(result, (err, docs) => {
            console.log(docs);
            res.json({status: 'success', data: docs })
        })
    })
    
})

module.exports = router;