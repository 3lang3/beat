'use strict';

let cheerio = require('cheerio');
let async = require('async');
let _G = require('./../base/base.config');
let Common = require('./../base/event');
let _ = require('lodash');

// class BuyClass {
//     constructor(option) {
//         this.id = option.id;
//         this.gem = option.type ? true : false;
//         this.type = option.type;
//         this.price = option.price;
//         this.detail = option.detail || false;
//         this.pageUrl = _G.C5.baseUrl + 'dota/' + option.id + '/S.html';
//         this.task = option.task;
//         this.switch = null;
//         this.name = null;
//         this.image = null;
//         this.saleID = null;
//         this.only = option.only || null;
//         this.marketPrice = null;
//         this.saleNumber = null;
//         this.saling = null;
//         this.purchasing = null;
//     }

//     init(callback) {

//         this.getItemInfo(() => {
//             callback && callback();
//             if(this.only) {
//                 // page 1
//                 async.forever(
//                     (next) => {
//                         this.flow(() => next(this.switch));
//                     }, (err) => {
//                         console.log('Buy showdown: ', this.name, this.id);
//                     }
//                 );
//                 // page >= 2
//                 async.forever(
//                     (next) => {
//                         this.flowSecond(() => setTimeout(() => next(this.switch) , _G.Time.fetchInterval));
//                     }, (err) => {
//                         console.log('Buy showdown: ', this.name, this.id, 'Second!!!');
//                     }
//                 );
//             }else {
//                 async.forever(
//                     (next) => {
//                         this.flow(() => setTimeout(() => next(this.switch) , _G.Time.fetchInterval));
//                     }, (err) => {
//                         console.log('Buy showdown: ', this.name, this.id);
//                     }
//                 );
//             }
//         });
//     }

//     flow(callback) {
//         async.waterfall([
//             this.getPageAndId.bind(this),
//             this.getItemAllPage.bind(this),
//             this.getItemDetail.bind(this)
//         ], (err, result) => {
//             if (err) console.log('waterfall results err');
//             if(result.length > 0) {
//                 async.mapLimit(result, 1, Common.C5Payment, (err, result) => {
                    
//                 })
//             }
//             callback && callback(null, result)
//         })
//     }
//     flowSecond(callback) {
//         async.waterfall([
//             this.getPageAndIdSecond.bind(this),
//             this.getItemAllPageSecond.bind(this),
//             this.getItemDetail.bind(this)
//         ], (err, result) => {
//             if (err) console.log('waterfall results err');
//             if(result.length > 0) {
//                 async.mapLimit(result, 1, Common.C5Payment, (err, result) => {
                    
//                 })
//             }
//             callback && callback(null, result)
//         })
//     }
//     // 初始化item 基本信息 purchaseID, saleID, image, name
//     getItemInfo(callback) {
//         async.waterfall([
//             (_c) => {
//                 Common.getItemInfo(this.id, _c);
//             }
//         ], (err, result) => {
//             this.saleID = result.saleID;
//             this.image = result.image;
//             this.name = result.name;
//             this.marketPrice = result.marketPrice;
//             this.saleNumber = result.saleNumber;
//             this.saling = result.saling;
//             this.purchasing = result.purchasing;

//             callback && callback();
//         })
//     }

//     getPageAndId(callback) {
//         console.log('fetching: ', this.pageUrl, new Date(), this.name);
//         let pageTotal;
//         if(this.only) return callback(null, 1);
//         Common.fetchGet({
//             url: this.pageUrl,
//             callback: (data) => {
//                 let $ = cheerio.load(data.text);
//                 pageTotal = $('.pagination .last').length ? $('.pagination .last a').attr('href').split('/S/')[1].split('.')[0] : 1;
//                 callback(null, pageTotal);
//             }
//         })
//     }

//     getPageAndIdSecond(callback) {
//         console.log('fetching: ', this.pageUrl, new Date(), this.name, 'Second!!!!!');
//         let pageTotal;
//         Common.fetchGet({
//             url: this.pageUrl,
//             callback: (data) => {
//                 let $ = cheerio.load(data.text);
//                 pageTotal = $('.pagination .last').length ? $('.pagination .last a').attr('href').split('/S/')[1].split('.')[0] : 1;
//                 callback(null, pageTotal);
//             }
//         })
//     }

//     getItemAllPage(pageTotal, callback) {
//         // if (pageTotal > 6) pageTotal = 5;
//         async.timesSeries(pageTotal, (n, next) => {
//             this.getItem(n, this.saleID, (err, result) => {
//                 next(err, result);
//             })
//         }, (err, results) => {
//             if (err) console.log(err);
//             callback(null, _.flatten(results))
//         });
//     }

//     getItemAllPageSecond(pageTotal, callback) {
//         // if (pageTotal > 6) pageTotal = 5;
//         async.timesSeries(pageTotal, (n, next) => {
//             if (n === 0) return next(null, []);
//             this.getItem(n, this.saleID, (err, result) => {
//                 next(err, result);
//             })
//         }, (err, results) => {
//             if (err) console.log(err);
//             callback(null, _.flatten(results))
//         });
//     }

//     getItemDetail(items, callback) {
//         async.map(items, this.getDetail.bind(this), (err, results) => {
//             if(err) console.log('getItemDetail Err');
//             callback(null, _.filter(results, (r) => r !== null))
//         })
//     }
    
//     getItem(page, steamId, callback) {
//         let _page = page + 1;
//         let _url = _G.C5.saleUrl + '?id=' + steamId + '&page=' + _page;

//         Common.fetchGet({
//             url: _url,
//             callback: (data) => {
//                 let _r = [];
//                 try {
//                     let json = eval('(' + data.text + ')');
//                     if (json.status == 200) {
//                         _r = json.body.items;
//                     }
//                 } catch (error) {
//                     console.log('Json parse Error: ', steamId)
//                 }
//                 callback(null, _r);
//             }
//         })
//     }

//     getDetail(item, callback) {
//         let isGem = this.gem,
//             isDetail = this.detail ? true : false;

//         async.waterfall([
//             // 价格筛选
//             (_c) => {
//                 if(item.price <= this.price && item.owner.id != _G.User.id) {
//                     _c(null, item);
//                 }else {
//                     _c(null, null);
//                 }
//             },
//             // 是否含有宝石筛选
//             (item, _c) => {
//                 if(_.isNull(item)) return _c(null, null);
//                 if(this.gem) {
//                     if(item.gem.has_gem) {
//                         _c(null, item);
//                     }else {
//                         _c(null, null);
//                     };
//                 }else {
//                     _c(null, item);
//                 }
//             },
//             // 筛选具体宝石类型
//             (item, _c) => {
//                 if(_.isNull(item)) return _c(null, null);
//                 if(this.type) {
//                     let _target, _typeArray = _.isArray(this.type) ? this.type : [this.type];

//                     item.gem.image.map((n) => {
//                         _typeArray.map((m) => {
//                             if (n.indexOf(m) > -1) return _target = true;
//                         })
//                     })

//                     if (_target) {
//                         _c(null, item)
//                     } else {
//                         _c(null, null);
//                     }
//                 }else {
//                     _c(null, item)
//                 }
//             },
//             (item, _c) => {
//                 // 筛选详情 同时屏蔽部分动能
//                 if(_.isNull(item)) return _c(null, null);
//                 if(this.detail) {
//                     let _url = _G.C5.detailUrl + '?classid=' + item.classid + '&instanceid=' + item.instanceid;
//                     Common.fetchGet({
//                         url: _url,
//                         callback: (data) => {
//                             let $ = cheerio.load(data.text, { decodeEntities: false });
//                             let content = $('.info').html();

//                             if (content.indexOf(this.detail) > -1) {
//                                 _c(null, item);
//                             }else {
//                                 _c(null, null);
//                             }
//                         }
//                     })
//                 }else {
//                     if(item.gem.gem_style.join('').indexOf('远行之宝') > -1 ) {
//                         _c(null, null);
//                     }else {
//                         _c(null, item);
//                     }
//                 }
//             }
//         ], (err, result) => {
//             callback(null, result)
//         })
//     }
// }


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
    }

    init(callback) {
        callback && callback();
        async.forever(
            (next) => {
                this.flow(() => setTimeout(() => next(this.switch) , _G.Time.fetchInterval));
            }, (err) => {
                console.log('Buy showdown: ', this.name, this.id);
            }
        );

        if(this.only) {
            async.forever(
                (next) => {
                    this.flowSecond(() => next(this.switch));
                }, (err) => {
                    console.log('Buy showdown: ', this.name, this.id);
                }
            );
        }
    }

    flow(callback) {
        console.log('fetch: ', this.name, this.id);
        async.waterfall([
            this.getItemDetailArray.bind(this),
            this.getItemDetail.bind(this)
        ], (err, result) => {
            if(result.length > 0) {
                async.mapLimit(result, 1, Common.C5Payment, (err, result) => {
                    
                })
            }
            callback && callback(result);
        })
    }

    flowSecond(callback) {
        console.log('fetch: ', this.name, this.id, 'only first page!');
        async.waterfall([
            this.getItemDetailArrayOnly.bind(this),
            this.getItemDetail.bind(this)
        ], (err, result) => {
            async.mapLimit(result, 1, Common.C5Payment, (err, result) => {
                    
            })
            callback && callback(result);
        })
    }
    
    getItemDetailArray(callback) {
        let page = 2, status = true, resultAry = [];
        
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
                    let json = eval('(' + data.text + ')');

                    if(json.status == 200) {
                        callback(null, _.flatten(json.body.items));
                    }else {
                        callback(null, []);
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

        async.waterfall([
            // 价格筛选
            (_c) => {
                if(item.price <= this.price && item.owner.id != _G.User.id) {
                    _c(null, item);
                }else {
                    _c(null, null);
                }
            },
            // 是否含有宝石筛选
            (item, _c) => {
                if(_.isNull(item)) return _c(null, null);
                if(this.gem) {
                    if(item.gem.has_gem) {
                        _c(null, item);
                    }else {
                        _c(null, null);
                    };
                }else {
                    _c(null, item);
                }
            },
            // 筛选具体宝石类型
            (item, _c) => {
                if(_.isNull(item)) return _c(null, null);
                if(this.type) {
                    let _target, _typeArray = _.isArray(this.type) ? this.type : [this.type];

                    item.gem.image.map((n) => {
                        _typeArray.map((m) => {
                            if (n.indexOf(m) > -1) return _target = true;
                        })
                    })

                    if (_target) {
                        _c(null, item)
                    } else {
                        _c(null, null);
                    }
                }else {
                    _c(null, item)
                }
            },
            (item, _c) => {
                // 筛选详情 同时屏蔽部分动能
                if(_.isNull(item)) return _c(null, null);
                if(this.detail) {
                    let _url = _G.C5.detailUrl + '?classid=' + item.classid + '&instanceid=' + item.instanceid;
                    Common.fetchGet({
                        url: _url,
                        callback: (data) => {
                            let $ = cheerio.load(data.text, { decodeEntities: false });
                            let content = $('.info').html();

                            if (content.indexOf(this.detail) > -1) {
                                _c(null, item);
                            }else {
                                _c(null, null);
                            }
                        }
                    })
                }else {
                    if(item.gem.has_gem && item.gem.gem_style.join('').indexOf('远行之宝') > -1 ) {
                        _c(null, null);
                    }else {
                        _c(null, item);
                    }
                }
            }
        ], (err, result) => {
            callback(null, result)
        })
    }
}

module.exports = BuyClass;