'use strict'

let cheerio = require('cheerio');
let async = require('async');
let _G = require('./../base/base.config');
let Common = require('./../base/common');
let _ = require('lodash');

class GemCourier {
    constructor(option) {
        this.type = option.type;
    }

    flow(callback) {
        async.waterfall([
            this.getCourierPageTotal.bind(this),
            this.getAllCourier.bind(this)
        ], (err, result) => {
            console.log(result);
        })
    }

    getCourierPageTotal(callback) {
        Common.FetchEvent({
            url: _G.C5.courierUrl,
            callback: (data) => {
                let $ = cheerio.load(data.text),
                    pageTotal = $('.sale-pagination').length > 0 ? $('.sale-pagination').find('li.last a').attr('href').split('page=')[1] : 1;

                callback(null, pageTotal);
            }
        })
    }

    getAllCourier(pageTotal, callback) {
        async.timesSeries(pageTotal, (n, next) => {
            getPageCourier(n, (err, result) => {
                next(err, result);
            })
        }, (err, results) => {
            if (err) console.log(err);
            callback(null, _.flatten(results))
        });
    }

    getPageCourier(n, callback) {
        let _url = _G.C5.courierUrl + '&page=' + (n + 1);

        Common.FetchEvent({
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
                                price: $(el).find('.price').replace(/[^0-9]/ig, "")
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
                                price: $(el).find('.price').replace(/[^0-9]/ig, "")
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