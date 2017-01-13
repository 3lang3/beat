'use strict'

let cheerio = require('cheerio');
let superagent = require('superagent');
let _G = require('./../base/base.config');
let Common = require('./../base/event');
let DataClass = require('./../model/Item');

function getList(word, callback) {
    let q = new RegExp(word);

    DataClass.find({'name': q}, (err, docs) => {
        console.log(docs)
        callback && callback(null, docs);
    })
}

module.exports = getList;