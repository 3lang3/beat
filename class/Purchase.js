'use strict'

let cheerio = require('cheerio');
let async = require('async');
let _G = require('./../base/base.config');
let Common = require('./../base/common');
let _ = require('lodash');

class PurchaseClass{
    constructor(option) {
        this.id = option.id;
        this.time = option.time || 1;
        this.price = null;
        this.num = option.num || 1,
        this.switch = null;
        this.task = option.task;
        this.name = null;
        this.image = null;
        this.saleID = null;
        this.purchaseID = null;
        this.firstSale = null;
        this.firstPurchase = null;
        this.maxPurchasePrice = false;
        this.count = 0;
    }

    // 初始化程序
    init(callback) {
        this.getItemInfo(() => {
            callback && callback();
            async.forever(
                (next) => {
                    this.flow(() => {
                        setTimeout(() => next(this.switch), this.time * 60 * 1000);
                    });
                }, (err) => {
                    this.cancelFlow();
                }
            );
        });
    }
    // 整合工作流
    flow(callback) {
        console.log('Purchase Item:', this.name, this.id, new Date());
        async.waterfall([
            this.getItemFirstItem.bind(this),
            this.compareTypePrice.bind(this),
            this.findPurchaseFirstItem.bind(this),
            this.ifNeedCancelPurchase.bind(this),
            this.submitlPurchase.bind(this)
        ], (err, result) => {
            if (err) console.log(err, 'waterfall results err');
            callback && callback(null, result)
        })
    }
    // 整合取消求购流
    cancelFlow(callback) {
        async.waterfall([
            (_c) => {
                this.getPurchasingList(this.name, _c)
            },
            (_id, _c) => {
                this.cancelPurchase(_id, _c)
            }
        ], (err, result) => {

        })
    }
    // 初始化item 基本信息 purchaseID, saleID, image, name
    getItemInfo(callback) {
        async.waterfall([
            (_c) => {
                Common.initInfoEvent(this.id, _c);
            }
        ], (err, result) => {

            this.saleID = result.saleID;
            this.purchaseID = result.purchaseID;
            this.image = result.image;
            this.name = result.name;
            callback && callback();
        })
    }

    // 获取当前item 卖一和求一list
    getItemFirstItem(callback) {
        async.parallel([
            (_c) => {
                Common.getFirstItem(this.saleID, 'sale', _c);
            },
            (_c) => {
                Common.getFirstItem(this.purchaseID, 'purchase', _c);
            }
        ], (err, result) => {
            callback(null, result)
        })
    }
    // 比较卖一价格和求一价格 同时判断当前求一是不是Admin
    compareTypePrice(items, callback) {
        this.firstSale = items[0];
        this.firstPurchase = items[1] || this.firstSale;
        
        let _price = items[1].price*1 || parseFloat(items[0].price) * 0.8;
        let myPrice = _price > 100 ? (_price + 0.1).toFixed(1) : (_price + 0.01).toFixed(2);
        let result = true;

        this.price = ( myPrice >= parseFloat(items[0].price) ) ? _price : myPrice;

        if( items[1].owner.id == _G.User.id || this.maxPurchasePrice ) result = false;

        if(this.price == _price) {
            this.maxPurchasePrice = true;
        }else {
            this.maxPurchasePrice = false;
        }

        return callback(null, result);
    }

    getPurchasingList(name, callback) {
        // 请求admin的purchaseList 检查是否重复求购
        Common.FetchEvent({
            url: _G.C5.purchaseList,
            cookie: global.cookie,
            callback: (data) => {
                let $ = cheerio.load(data.text);
                let listAry = [], _list;

                // 判断purchaseList 是否存在 
                if($('.sale-record-bottom').length > 0) {
                    // 存在purchaseList  继续判断是否重复求购
                    $('.sale-record-bottom').each((i, el) => {
                        listAry.push({
                            name: $(el).find('img').attr('alt'),
                            id: $(el).find('.purchase-cancel').attr('data-id')
                        });
                    })
                }else {
                    // 不存在 直接发布当前item的Purchase
                    return callback(null, true);
                }

                _.map(listAry, (list) => {
                    if(_.includes(list, name)) {
                        _list = list
                    }
                })

                // 重复求购 返回取消求购的cancelID
                if (_list) {
                    callback(null, _list.id);
                }else {
                    // 非重复求购 continue
                    callback(null, true);
                }
            }
        })
    }

    findPurchaseFirstItem(bool, callback) {
        if(bool) {
            // 需要进行purchase流程
            this.getPurchasingList(this.name, callback);
        }else {
            // 不需要进行求购处理
            callback(null, null);
        }
    }

    ifNeedCancelPurchase(obj, callback) {
        if(obj == null || obj == false) return callback(null, null);
        if(this.count >= 2) return callback(null, true);
        this.cancelPurchase(obj, callback);
    }

    cancelPurchase(id, callback) {

        if(this.count >= 2) {
            return callback(null, true);
        }

        Common.FetchEvent({
            url: _G.C5.purchaseCancel,
            type: 'post',
            cookie: global.cookie,
            data: {
                id: id
            },
            callback: (data) => {
                
                if(JSON.parse(data.text).status == 200) {
                    this.count++;
                    this.reduceCount()
                }
                console.log('取消求购', this.name, JSON.parse(data.text), this.count)
                callback && callback(null, true);
            }
        })
    }

    submitlPurchase(target, callback) {
        if(target == null || this.switch == true) return callback(null, true);

        Common.FetchEvent({
            url: _G.C5.purchaseSubmit,
            type: 'post',
            cookie: global.cookie,
            data: {
                id: this.id,
                price: this.price,
                num: this.num,
                delivery: 'on'
            },
            callback: (data) => {
                console.log('发布求购: ', this.name, JSON.parse(data.text))
                callback && callback(null, true);
            }
        })
    }

    reduceCount(callback) {
        setTimeout(() => {
            this.count--;
        }, 60*60*1000)
    }
}

module.exports = PurchaseClass;