'use strict'

let cheerio = require('cheerio');
let async = require('async');
let _G = require('./../base/base.config');
let Common = require('./../base/event');
let _ = require('lodash');

class DataClass{
    constructor(options) {
        this.lists = JSON.parse(options);
    }

    flow(callback) {
        async.waterfall([
            this.dealSourceData.bind(this),
            this.fetchTotal.bind(this),
            this.fetchUrlItems.bind(this),
            this.fetchItemIds.bind(this)
        ], (err, result) => {
            callback && callback(null, result)
        })
    }

    dealSourceData(callback) {
        let urlAry = [];
        this.lists.map((list) => {
            urlAry.push(_G.C5.dotaUrl + '?only=on&' + JSON.parse(list.value).type + '=' + JSON.parse(list.value).value);
        })

        callback(null, urlAry);
    }

    fetchTotal(urlAry, callback) {
        async.mapLimit(urlAry, 1, Common.getPageTotalNumber, (err, result) => {

            let newAry = [];
            _.forEach(urlAry, (url, i) => {
                newAry.push({
                    url: url,
                    page: result[i]
                })
            })

            callback(null, newAry)
        })
    }

    fetchUrlItems(urlPageAry, callback) {
        async.mapSeries(urlPageAry, (urlPage, callback) => {
            async.timesSeries(urlPage.page, (page, next) => {
                Common.fetchGet({
                    url: urlPage.url + '&page=' + (page+1),
                    callback: (data) => {
                        let $ = cheerio.load(data.text),
                            $items = $('li.selling'), obj, resultAry = [];

                        if(!$items.length) return next(null, []);
                        $items.each((i, el) => {
                            obj = {
                                id: parseFloat($(el).find('.img').attr('href').replace(/[^0-9]/ig, "")),
                                image: $(el).find('img').attr('src'),
                                type: urlPage.url.indexOf('type=ward&') > -1 ? 'ward' : 'hero',
                                name: $(el).find('img').attr('alt')
                            }
                            resultAry.push(obj);
                        })
                        next(null, resultAry);
                    }
                })
            }, (err, results) => {
                callback(null, _.flatten(results))
            });
        }, (err, result) => {
            callback(null, _.flatten(result));
        })
    }

    fetchItemIds(objAry, callback) {

        async.mapSeries(objAry, (obj, callback) => {
            Common.getItemInfo(obj.id, callback)
        }, (err, result) => {
            callback(null, result);
        })
    }
}

module.exports = DataClass;