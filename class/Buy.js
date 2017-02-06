'use strict';

let cheerio = require('cheerio');
let async = require('async');
let _G = require('./../base/base.config');
let Common = require('./../base/event');
let _ = require('lodash');


class BuyClass {
    constructor(option) {
        this.id = option.id;
        this.gem = option.type ? true : false;
        this.type = option.type;
        this.price = option.price || 0;
        this.detail = option.detail || false;
        this.task = option.task;
        this.switch = null;
        this.name = option.name || 'No name';
        this.image = option.image || undefined;
        this.saleID = option.saleID || 0;
        this.only = option.only || null;
        this.onlyFirstPage = option.onlyFirstPage || null;
        //this.timer = null;
    }

    init(callback) {
        callback && callback();
        if(this.onlyFirstPage) {
            async.forever(
                (next) => {
                    this.flowSecond(() => setTimeout(() => next(this.switch) , _G.Time.fetchInterval));
                }, (err) => {
                    console.log('Buy showdown: ', this.name, this.id);
                }
            );
        }else {
            async.forever(
                (next) => {
                    this.flow(() => setTimeout(() => next(this.switch) , _G.Time.fetchInterval));
                }, (err) => {
                    //clearInterval(this.timer);
                    console.log('Buy showdown: ', this.name, this.id);
                }
            );

            if(this.only) {
                setInterval(() => this.flowSecond(), 120);
            }
        }
        
    }

    flow(callback) {
        //console.log('fetch: ', this.name, this.id);
        async.waterfall([
            this.getItemDetailArray.bind(this),
            this.getItemDetail.bind(this)
        ], (err, result) => {
            if(result.length > 0) {
                // async.mapLimit(result, 1, Common.C5Payment, (err, result) => {
                    
                // })
            }
            callback && callback(result);
        })
    }

    flowSecond(callback) {
        //console.log('fetch: ', this.name, this.id, 'only first page!');
        async.waterfall([
            this.getItemDetailArrayOnly.bind(this),
            this.getItemDetail.bind(this)
        ], (err, result) => {
            // async.mapLimit(result, 1, Common.C5Payment, (err, result) => {
                    
            // })
            callback && callback(result);
        })
    }
    
    getItemDetailArray(callback) {
        let page = 1, status = true, resultAry = [];
        if(this.only) page = 2;
        async.whilst(
            () => status,
            (_c) => {
                let _url = _G.C5.saleUrl + '?id=' + this.saleID + '&page=' + page;
                Common.fetchGet({
                    url: _url,
                    callback: (data) => {
                        let json = eval('(' + data.text + ')');

                        if(json.status == 200) {
                            page++;
                            resultAry.push(json.body.items);
                        }else {
                            status = false;
                        }
                        _c();
                    }
                })
            },
            (err) => {
                callback(null, _.flatten(resultAry));
            }
        )
    }

    getItemDetailArrayOnly(callback) {
        let page = 1;

        let _url = _G.C5.saleUrl + '?id=' + this.saleID + '&page=' + page;
            Common.fetchGet({
                url: _url,
                callback: (data) => {
                    
                    try {
                        let json = eval('(' + data.text + ')');
                        if(json.status == 200) {
                            callback(null, _.flatten(json.body.items));
                        }else {
                            callback(null, []);
                        }
                    } catch (error) {
                        return callback(null, []);
                    }
                    
                    
                }
            })
    }

    getItemDetail(items, callback) {
        async.map(items, this.getDetail.bind(this), (err, results) => {
            if(err) console.log('getItemDetail Err');
            callback(null, _.filter(results, (r) => r !== null))
        })
    }

    getDetail(item, callback) {
        let isGem = this.gem,
            isDetail = this.detail ? true : false;

        if(item.price > this.price || item.owner.id == _G.User.id) return callback(null, null);
        if(this.gem && !item.gem.has_gem) return callback(null, null);
        if(this.type) {
            let _target, _typeArray = _.isArray(this.type) ? this.type : [this.type];

            item.gem.image.map((n) => {
                _typeArray.map((m) => {
                    if (n.indexOf(m) > -1) return _target = true;
                })
            })

            if (!_target) return callback(null, null);
        }
        if(this.detail) {
            let _url = _G.C5.detailUrl + '?classid=' + item.classid + '&instanceid=' + item.instanceid;
            Common.fetchGet({
                url: _url,
                callback: (data) => {
                    let $ = cheerio.load(data.text, { decodeEntities: false });
                    let content = $('.info').html();

                    if (content.indexOf(this.detail) > -1) {
                        callback(null, item);
                    }else {
                        callback(null, null);
                    }
                }
            })
        }else {
            if(item.gem.has_gem && item.gem.gem_style.join('').indexOf('远行之宝') > -1 ) return callback(null, null);

            Common.C5Payment(item);
            callback(null, item);
        }
        // async.waterfall([
        //     // 价格筛选
        //     (_c) => {
        //         if(item.price <= this.price && item.owner.id != _G.User.id) {
        //             _c(null, item);
        //         }else {
        //             _c(null, null);
        //         }
        //     },
        //     // 是否含有宝石筛选
        //     (item, _c) => {
        //         if(_.isNull(item)) return _c(null, null);
        //         if(this.gem) {
        //             if(item.gem.has_gem) {
        //                 _c(null, item);
        //             }else {
        //                 _c(null, null);
        //             };
        //         }else {
        //             _c(null, item);
        //         }
        //     },
        //     // 筛选具体宝石类型
        //     (item, _c) => {
        //         if(_.isNull(item)) return _c(null, null);
        //         if(this.type) {
        //             let _target, _typeArray = _.isArray(this.type) ? this.type : [this.type];

        //             item.gem.image.map((n) => {
        //                 _typeArray.map((m) => {
        //                     if (n.indexOf(m) > -1) return _target = true;
        //                 })
        //             })

        //             if (_target) {
        //                 _c(null, item)
        //             } else {
        //                 _c(null, null);
        //             }
        //         }else {
        //             _c(null, item)
        //         }
        //     },
        //     (item, _c) => {
        //         // 筛选详情 同时屏蔽部分动能
        //         if(_.isNull(item)) return _c(null, null);
        //         if(this.detail) {
        //             let _url = _G.C5.detailUrl + '?classid=' + item.classid + '&instanceid=' + item.instanceid;
        //             Common.fetchGet({
        //                 url: _url,
        //                 callback: (data) => {
        //                     let $ = cheerio.load(data.text, { decodeEntities: false });
        //                     let content = $('.info').html();

        //                     if (content.indexOf(this.detail) > -1) {
        //                         _c(null, item);
        //                     }else {
        //                         _c(null, null);
        //                     }
        //                 }
        //             })
        //         }else {
        //             if(item.gem.has_gem && item.gem.gem_style.join('').indexOf('远行之宝') > -1 ) {
        //                 _c(null, null);
        //             }else {
        //                 _c(null, item);
        //             }
        //         }
        //     }
        // ], (err, result) => {
        //     callback(null, result)
        // })
    }
}

module.exports = BuyClass;