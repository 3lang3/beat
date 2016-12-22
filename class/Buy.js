'use strict'

let cheerio = require('cheerio');
let async = require('async');
let _G = require('./../base/base.config');
let Common = require('./../base/common');
let _ = require('lodash');

class BuyClass {
    constructor(option) {
        this.id = option.id;
        this.gem = option.type ? true : false;
        this.type = option.type;
        this.price = option.price;
        this.detail = option.detail || false;
        this.pageUrl = _G.C5.baseUrl + 'dota/' + option.id + '/S.html';
        this.task = option.task;
        this.switch = null;
        this.name = null;
        this.img = null;
    }

    init() {
        async.forever(
            (next) => {
                setTimeout(() => {
                    this.flow();
                    next(this.switch);
                }, 5*1000);
            }, (err) => {
                console.log('Buy showdown: ', this.id);
            }
        );
    }

    flow(callback) {
        async.waterfall([
            this.getPageAndId.bind(this),
            this.getItemAllPage.bind(this),
            this.getItemDetail.bind(this)
        ], (err, result) => {
            if (err) console.log('waterfall results err');
            if(result.length > 0) {
                async.mapLimit(result, 1, Common.C5Payment, (err, result) => {

                })
            }
            callback && callback(null, result)
        })
    }

    getPageAndId(callback) {
        console.log('fetching: ', this.pageUrl, new Date());
        let pageTotal, steamId;

        Common.FetchEvent({
            url: this.pageUrl,
            callback: (data) => {
                let $ = cheerio.load(data.text);

                pageTotal = $('.pagination .last').length ? $('.pagination .last a').attr('href').split('/S/')[1].split('.')[0] : 1;
                steamId = $('#sale').find('tbody').attr('data-url').split('=')[1].split('&')[0];

                callback(null, pageTotal, steamId);
            }
        })
    }

    getItemAllPage(pageTotal, steamId, callback) {

        if (pageTotal > 5) pageTotal = 4;

        async.timesSeries(pageTotal, (n, next) => {
            this.getItem(n, steamId, (err, result) => {
                next(err, result);
            })
        }, (err, results) => {
            if (err) console.log(err);
            callback(null, _.flatten(results))
        });
    }

    getItemDetail(items, callback) {
        async.map(items, this.getDetail.bind(this), (err, results) => {
            if(err) console.log('getItemDetail Err');
            callback(null, _.filter(results, (r) => r !== null))
        })
    }

    getItem(page, steamId, callback) {
        let _page = page + 1;
        let _url = _G.C5.saleUrl + '?id=' + steamId + '&page=' + _page;

        Common.FetchEvent({
            url: _url,
            callback: (data) => {
                let _r = [];
                try {
                    let json = eval('(' + data.text + ')');
                    if (json.status == 200) {
                        _r = json.body.items;
                    }
                } catch (error) {
                    console.log('Json parse Error: ', steamId)
                }
                callback(null, _r);
            }
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
            // 筛选具体宝石
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
                    Common.FetchEvent({
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
                    if(item.gem.gem_style.join('').indexOf('远行之宝') > -1) {
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