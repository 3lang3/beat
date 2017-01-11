'use strict'

let cheerio = require('cheerio');
let async = require('async');
let superagent = require('superagent');
let _G = require('./../base/base.config');
let Common = require('./../base/event');
let _ = require('lodash');

class PurchaseSale {
    constructor() {
        this.switch = null;
        this.time = 60;
    }

    init() {
        console.log('PurchaseSale start!!!')
        let timer;
        async.forever(
            (next) => {
                timer = setTimeout(() => {
                    next(this.switch);
                    this.flow();
                }, this.time*1000);
            }, (err) => {
                clearTimeout(timer);
                console.log('PurchaseSale down');
            }
        );
    }

    flow() {
        async.waterfall([
            this.getInventoryIds.bind(this),
            this.getInventoryMinPrice.bind(this),
            this.inventoryAutoSale.bind(this)
        ], (err, result) => {
            if (err) console.log(err, 'PurchaseSale waterfall results err');;
        })
    }

    getInventoryIds(callback) {
        console.log('Purchase autoSaleing...');
        let saleNames = [], saleIds = [];
        
        _.map(global.TaskHash, (task) => {
            if(task.task == 'purchase') {
                saleNames.push(task.name);
            }
        });

        Common.fetchGet({
            url: _G.C5.inventoryList,
            callback: (data) => {
                let $ = cheerio.load(data.text),
                    $items = $('#inventory-item-form li.item');

                if($items.length > 0) {
                    $items.each((i, el) => {
                        saleNames.map((name) => {
                            if($(el).find('img').attr('alt') == name ) {
                                saleIds.push($(el).find('input[name="id[]"]').val());
                            }
                        })
                    })
                }

                callback(null, saleIds);
            }
        })
    }

    getInventoryMinPrice(saleIds, callback) {
        if(!saleIds.length) return callback(null, [], []); 
        let prices = [];
        superagent
            .post(_G.C5.quickUrl)
            .type('form')
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36')
            .set('Cookie', global.cookie)
            .set('Accept-Language', 'zh-CN,zh')
            .field({
                'id[]': saleIds
            })
            .end((err, data) => {
                let $ = cheerio.load(data.text, {decodeEntities: false});
                $('li[data-min-sell]').each((i, el) => {
                    prices.push(($(el).data('min-sell')*1 - 0.01));
                })
                callback(null, saleIds, prices);
            })
    }

    inventoryAutoSale(saleIds, prices, callback) {
        if(!saleIds.length || !prices.length) return callback(null, null);
        superagent
            .post(_G.C5.onsaleUrl)
            .type('form')
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36')
            .set('Cookie', global.cookie)
            .set('Accept-Language', 'zh-CN,zh')
            .field({
                'id[]': saleIds,
                'price[]': prices,
                'bargain': 'Y'
            })
            .end((err, data) => {
                let json = JSON.parse(data.text);

                console.log(json);
                if(json.status == 200) {
                    
                }
                callback(null, json);
            })
    }
}

module.exports = PurchaseSale;