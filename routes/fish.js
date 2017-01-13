'use strict';

var express = require('express');
var router = express.Router();
var Fish = require('./../model/Fish');
var async = require('async');
var _G = require('./../base/base.config');

router.post('/', (req, res, next) => {

    async.waterfall([
        (callback) => {
            Fish.find({ 'option.id': req.body.id }, (err, doc) => {
                if (err) return res.json({ status: 0, message: 'err' });
                doc.length > 0 ? callback(null, false) : callback(null, true);
            })
        }
    ], (err, result) => {
        if (result) {
            let newFish = new Fish({
                name: req.body.name,
                image: req.body.image,
                option: req.body
            })
            newFish.save((err) => {
                if (err) res.json(err);
                Fish.find((err, doc) => {
                    res.json({ status: 'success', list: doc })
                })
            })
        } else {
            res.json({ status: 'error', message: 'has added' })
        }
    })
})

router.get('/', (req, res, next) => {
    Fish.find((err, doc) => {
        if (err) res.json(err);
        res.json({ status: 'success', list: doc })
    })
})

router.delete('/', (req, res, next) => {
    Fish.remove({ 'option.id': req.body.id }, (err, doc) => {
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