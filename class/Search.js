'use strict'

let cheerio = require('cheerio');
let superagent = require('superagent');
let _G = require('./../base/base.config');

function getList(word, callback) {
    superagent
        .get(_G.C5.dotaUrl + '?k=' + encodeURI(word) )
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36')
        .set('Accept-Language', 'zh-CN,zh')    
        .end((err, data) => {

            let $ = cheerio.load(data.text);
            let searchList = [];

            $('li.selling').each((i, el) => {
                searchList.push({
                    id: parseFloat($(el).find('.img').attr('href').split('/dota/')[1]),
                    img: $(el).find('img').attr('src'),
                    name: $(el).find('img').attr('alt'),
                    price: $(el).find('.price').text(),
                    num: $(el).find('.num').text()
                })
            })
            console.log(searchList[0])
            callback && callback(searchList);
        })
}

module.exports = getList;