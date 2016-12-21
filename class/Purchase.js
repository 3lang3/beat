'use strict'

let cheerio = require('cheerio');
let async = require('async');
let _G = require('./../base/base.config');
let Common = require('./../base/common');
let _ = require('lodash');

class PurchaseClass{
    constructor(option) {
        this.id = option.id;
        this.time = option.time || 5;
        this.price = null;
        this.num = option.num || 1,
        this.name = null;
        this.switch = null;
    }

    // 初始化程序
    init() {
        let timer;
        async.forever(
            (next) => {
                timer = setTimeout(() => {
                    next(this.switch);
                    this.flow();
                }, this.time*1000);
            }, (err) => {
                clearTimeout(timer);
                this.cancelFlow();
            }
        );
    }
    // 整合工作流
    flow(callback) {
        console.log('Purchase Item:', this.id, new Date());
        async.waterfall([
            this.getSalePurchaseID.bind(this),
            this.compareTypePrice.bind(this),
            this.findPurchaseFirstItem.bind(this),
            this.ifNeedCancelPurchase.bind(this),
            this.submitlPurchase.bind(this)
        ], (err, result) => {
            if (err) console.log(err, 'waterfall results err');
            callback && callback(null, result)
        })
    }
    // 整合取消求购工作流
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
    // 获取当前item的 purchaseID 和 saleID
    getSalePurchaseID(callback) {
        Common.getItemTypePrice(this.id, callback);
    }
    // 比较卖一价格和求一价格 同时判断当前求一是不是Admin
    compareTypePrice(price, callback) {
        let _price = price[1].num*1;
        let myPrice = _price > 100 ? (price[1].num*1 + 0.1).toFixed(1) : (price[1].num*1 + 0.01).toFixed(2);
        let result = true;

        this.price = myPrice;
        this.name = price[1].name;


        if(myPrice >= parseFloat(price[0]) || price[1].isAuthor) result = false;

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
        this.cancelPurchase(obj, callback);
    }

    cancelPurchase(id, callback) {
        Common.FetchEvent({
            url: _G.C5.purchaseCancel,
            type: 'post',
            cookie: global.cookie,
            data: {
                id: id
            },
            callback: (data) => {
                console.log('取消求购', JSON.parse(data.text))
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
                console.log('发布求购: ', JSON.parse(data.text))
                callback && callback(null, true);
            }
        })
    }
}

module.exports = PurchaseClass;