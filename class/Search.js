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
    // Common.fetchGet({
    //     url: _G.C5.dotaUrl + '?k=' + encodeURI(word),
    //     callback: (data) => {
    //         let $ = cheerio.load(data.text);
    //         let searchList = [];

    //         $('li.selling').each((i, el) => {
    //             searchList.push({
    //                 id: parseFloat($(el).find('.img').attr('href').split('/dota/')[1]),
    //                 img: $(el).find('img').attr('src'),
    //                 name: $(el).find('img').attr('alt'),
    //                 price: $(el).find('.price').text(),
    //                 num: $(el).find('.num').text()
    //             })
    //         })
    //         console.log(searchList[0])
    //         callback && callback(searchList);
    //     }
    // })
}

module.exports = getList;