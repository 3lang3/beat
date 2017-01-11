'use strict'

let cheerio = require('cheerio');
let async = require('async');
let _G = require('./../base/base.config');
let Common = require('./../base/event');
let _ = require('lodash');

class GemCourier {
    constructor(option) {
        this.type = option;
        this.url = null;
    }

    flow(callback) {
        async.waterfall([
            this.getCourierPageTotal.bind(this),
            this.getAllCourier.bind(this)
        ], (err, result) => {
            callback && callback(null, result);
        })
    }

    getCourierPageTotal(callback) {
        this.url = (this.type == 'gem') ? _G.C5.effectUrl : _G.C5.courierUrl;
        Common.fetchGet({
            url: this.url,
            callback: (data) => {
                let $ = cheerio.load(data.text),
                    pageTotal = $('.sale-pagination').length > 0 ? $('.sale-pagination').find('li.last a').attr('href').split('page=')[1] : 1;

                callback(null, pageTotal);
            }
        })
    }

    getAllCourier(pageTotal, callback) {
        async.timesSeries(pageTotal, (n, next) => {
            this.getPageCourier(n, (err, result) => {
                next(err, result);
            })
        }, (err, results) => {
            if (err) console.log(err);
            callback(null, _.flatten(results))
        });
    }

    getPageCourier(n, callback) {
        let _url = this.url + '&page=' + (n + 1);

        Common.fetchGet({
            url: _url,
            callback: (data) => {
                let $ = cheerio.load(data.text);
                let ary = [];

                if(!$('li.selling').length) return callback(null, ary);
                $('li.selling').each((i, el) => {
                    if(this.type == 'gem') {
                        if($(el).find('img').attr('alt').indexOf('虚灵') > -1 || $(el).find('img').attr('alt').indexOf('棱彩') > -1) {
                            let obj = {
                                name: $(el).find('img').attr('alt'),
                                image: $(el).find('img').attr('src'),
                                id: $(el).find('a.img').attr('href').replace(/[^0-9]/ig, ""),
                                type: 'gem',
                                price: $(el).find('.price').text().match(/[1-9]\d*.\d*|0.\d*[1-9]\d*/)[0]
                            }
                            ary.push(obj);
                        }
                    }else {
                        if($(el).find('img').attr('alt').indexOf('贪魔') == -1 ) {
                            let obj = {
                                name: $(el).find('img').attr('alt'),
                                image: $(el).find('img').attr('src'),
                                id: $(el).find('a.img').attr('href').replace(/[^0-9]/ig, ""),
                                type: 'courier',
                                price: $(el).find('.price').text().match(/[1-9]\d*.\d*|0.\d*[1-9]\d*/)[0]
                            }
                            ary.push(obj);
                        }
                    }
                })

                callback(null, ary);
            }
        })
    }
}

module.exports = GemCourier;