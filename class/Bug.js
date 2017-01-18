'use strict';

let cheerio = require('cheerio');
let async = require('async');
let _G = require('./../base/base.config');
let Common = require('./../base/event');
let _ = require('lodash');
let DataClass = require('./../model/Item');

class BugClass {
    constructor(option) {
        this.time = option.time || 10;
        this.type = option.type;
        this.price = option.price || 1000;
        this.task = option.task;
        this.switch = null;
    }

    init(callback) {
        console.log(this.type);
        callback && callback();
        async.forever(
            (next) => {
                this.flow(() => setTimeout(() => next(this.switch) , this.time * 60 * 1000 ));
            }, (err) => {
                console.log('Bug showdown');
            }
        );
    }

    flow(callback) {
        async.waterfall([
            this.getList.bind(this),
            this.getListPages.bind(this),
            this.getItemDetailArray.bind(this),
            this.getItemDetail.bind(this)
        ], (err, result) => {
            console.log(result);
            callback && callback(result);
        })
    }

    getList(callback) {
        DataClass.find({type: { $in: this.type }}, (err, docs) => {
            callback && callback(null, docs);
        })
    }

    getListPages(docs, callback) {
        async.mapSeries(docs, this.getListSinglePage, (err, result) => {
            console.log(result);
            callback(null, _.filter(result, (r) => r !== null));
        })
    }

    getListSinglePage(doc, callback) {
        console.log('fetch:' , doc.name)
        let page = 1;
        let _url = _G.C5.baseUrl + 'dota/' + doc.id + '/S.html';
            Common.fetchGet({
                url: _url,
                callback: (data) => {
                    let $ = cheerio.load(data.text),
                        obj = {
                            name: doc.name,
                            saleID: doc.saleID,
                            gemIDs: []
                        };

                    if($('a[href*="gem-type-4"]').length > 0) {
                        $('.gem-select-list a').each((i, el) => {
                            obj.gemIDs.push($(el).attr('href').split('gem_id=')[1].split('&quick')[0]);
                        })
                        callback(null, obj);
                    }else {
                        callback(null, null);
                    }
                }
            })
    }

    getItemDetailArray(objs, callback) {
        if(!objs) return callback(null, []);
        async.mapSeries(objs, (obj, _C) => {
            async.mapSeries(obj.gemIDs, (gemID, _c) => {
                console.log('fetch detail:', obj.name, gemID)
                let _url = _G.C5.saleUrl + '?id=' + obj.saleID + '&page=1&gem_id=' + gemID;
                Common.fetchGet({
                    url: _url,
                    callback: (data) => {
                        let json = eval('(' + data.text + ')');

                        if(json.status == 200) {
                            _c(null, json.body.items);
                        }else {
                            _c(null, []);
                        }
                    }
                })
            }, (e, r) => {
                _C(null, _.flatten(r));
            })
        }, (err, result) => {
            callback(null, _.flatten(result));
        })
    }

    getItemDetail(items, callback) {
        if(!items) return callback(null, []);
        async.map(items, this.getDetail.bind(this), (err, results) => {
            if(err) console.log('getItemDetail Err');
            callback(null, _.filter(results, (r) => r !== null))
        })
    }

    getDetail(item, callback) {
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

                if(item.gem.has_gem && item.gem.gem_style.indexOf('虚灵宝石') > -1) {
                    _c(null, item);
                }else {
                    _c(null, null);
                };
            }
        ], (err, result) => {
            callback(null, result)
        })
    }
}

module.exports = BugClass;