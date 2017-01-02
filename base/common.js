'use strict'

let cheerio = require('cheerio');
let superagent = require('superagent');
let async = require('async');
let _ = require('lodash');
let _G = require('./base.config');
let PurchaseClass = require('./../class/Purchase');
let BuyClass = require('./../class/Buy');
let SendMail = require('./../class/Mail');

// 
function getItemTypeIdEvent(itemId, type, callback) {
    let _urlType = type == 'sale' ? '/S.html' : '/P.html',
        _url = _G.C5.baseUrl + 'dota/' + itemId + _urlType,
        p =  type == 'sale' ? '#sale' : '#buy';
    
    FetchEvent({
        url: _url,
        callback: (data) => {
            let $ = cheerio.load(data.text);
            let typeId = $(p).find('tbody').attr('data-url').split('=')[1].split('&')[0];
            let img = $('.sale-item-img img').attr('src');
            let title = $('.sale-item-img img').attr('alt');

            callback && callback(null, typeId);
        }
    })
}

exports.initInfoEvent = function(itemId, callback) {
    let _saleUrl = _G.C5.baseUrl + 'dota/' + itemId + '/S.html',
        _purchaseUrl = _G.C5.baseUrl + 'dota/' + itemId + '/P.html';

    async.parallel([
        (_c) => {
            FetchEvent({
                url: _saleUrl,
                callback: (data) => {
                    let $ = cheerio.load(data.text);
                    let typeId = $('#sale').find('tbody').attr('data-url').split('=')[1].split('&')[0];
                    let image = $('.sale-item-img img').attr('src');
                    let name = $('.sale-item-img img').attr('alt');
                    let page = $('.pagination .last').length ? $('.pagination .last a').attr('href').split('/S/')[1].split('.')[0] : 1;
                    _c(null, typeId, image, name, page);
                }
            })
        },
        (_c) => {
            FetchEvent({
                url: _purchaseUrl,
                callback: (data) => {
                    let $ = cheerio.load(data.text);
                    let typeId = $('#buy').find('tbody').attr('data-url').split('=')[1].split('&')[0];
                    _c(null, typeId);
                }
            })
        }
    ], (err, result) => {
        let [[saleID, image, name, page], purchaseID] = result;

        callback && callback(null, {saleID: saleID, purchaseID: purchaseID, image: image, name: name, page: page});
    })
}

exports.getFirstItem = function(id, type, callback) {
    let _url = type == 'sale' ? _G.C5.saleUrl + '?id=' + id : _G.C5.purchaseUrl + '?id=' + id;
    FetchEvent({
        url: _url,
        cookie: global.cookie,
        callback: (data) => {
            let _r = null,
            json = eval('(' + data.text + ')');

            if (json.status == 200) {
                _r = json.body.items[0];
            }

            callback(null, _r);
        }
    })
}

function getItemTypePriceEvent(ids, callback) {
    let [saleID, purchaseID] = ids,
        _saleUrl = _G.C5.saleUrl + '?id=' + saleID,
        _purchaseUrl = _G.C5.purchaseUrl + '?id=' + purchaseID;
    
    async.parallel([
        (_c) => {
            FetchEvent({
                url: _saleUrl,
                cookie: global.cookie,
                callback: (data) => {
                    let _r = {price: null},
                    json = eval('(' + data.text + ')');

                    if (json.status == 200) {
                        _r = json.body.items[0];
                    }

                    _c(null, _r.price);
                }
            })
        },
        (_c) => {
            FetchEvent({
                url: _purchaseUrl,
                cookie: global.cookie,
                callback: (data) => {
                    let _r = {price: null},
                    json = eval('(' + data.text + ')'),
                    _t = false;

                    if (json.status == 200) {
                        _r = json.body.items[0];
                        if(_r.owner.id == _G.User.id) {
                            _t = true;
                        }
                    }

                    _c(null, {num:_r.price, isAuthor: _t, name: _r.name });
                }
            })
        }
    ], (err, result) => {
        callback && callback(null, result);
    })
}

exports.getItemTypePrice = function(itemId, callback) {
    async.waterfall([
        (_c) => {
            getItemTypeId(itemId, _c)
        },
        (ids, _c) => {
            getItemTypePriceEvent(ids, _c);
        }
    ], (err, result) => {
        // result[0] 卖一价 
        // result[1] 求一价
        callback && callback(null, result);
    })
}

function getItemTypeId(itemId, callback) {
    async.parallel([
        (_c) => {
            getItemTypeIdEvent(itemId, 'sale', _c);
        },
        (_c) => {
            getItemTypeIdEvent(itemId, 'buy', _c);
        }
    ], (err, result) => {
        callback && callback(null, result);
    })
}



exports.getPurchasingList = function({name, callback}) {
    FetchEvent({
        url: _G.C5.getPurchasingList,
        callback: (data) => {
            let $ = cheerio.load(data.text);
            let listAry = [], _list;
            if($('.sale-record-bottom').length > 0) {
                $('.sale-record-bottom').each((i, el) => {
                    listAry.push({
                        name: $(el).find('img').attr('alt'),
                        id: $(el).find('.purchase-cancel').attr('data-id')
                    });
                })
            }else {
                return callback(null, false);
            }

            _.map(listAry, (list) => {
                if(_.includes(list, name)) {
                    _list = list
                }
            })

            if (_list) {
                callback(null, _list.id);
            }else {
                callback(null, false);
            }
        }
    })
}

function FetchEvent({url, type, data, callback, cookie}) {

    if(type == 'post') {
        superagent
            .post(url)
            .type('form')
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36')
            .set('Cookie', cookie || global.cookie)
            .set('Accept-Language', 'zh-CN,zh')
            .send(data)
            .timeout(5000)
            .end((err, datas) => {
                if (err) {
                    console.log(url, 'call again!');
                    return setTimeout(() => {
                        FetchEvent({url, type, data, callback, cookie})
                    }, 2000);
                }
                callback && callback(datas);
            })
    }else {
        superagent
            .get(url)
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36')
            .set('Cookie', cookie || global.cookie)
            .set('Accept-Language', 'zh-CN,zh')    
            .send(data)
            .timeout(5000)
            .end((err, datas) => {
                if (err) {
                    console.log(url, 'call again!');
                    return setTimeout(() => {
                        FetchEvent({url, type, data, callback, cookie})
                    }, 2000);
                }
                callback && callback(datas);
            })
    }
}

exports.getItemTypeId = getItemTypeId;
exports.FetchEvent = FetchEvent;

exports.postPurchase = function ({form, callback}) {
    FetchEvent({
        url: _G.C5.purchaseSubmit,
        type: 'post',
        data: form,
        cookie: G.cookie,
        callbacl: (data) => {
            callback(null, true);
        }
    })
}

exports.cancelPurchase = function ({data, callback}) {
    FetchEvent({
        url: _G.C5.purchaseCancel,
        type: 'post',
        data: data,
        cookie: global.cookie,
        callback: (data) => {
            callback && callback(data);
        }
    })
}

exports.C5Payment = function(item, callback) {
    FetchEvent({
        url: _G.C5.paymentUrl + '?id=' + item.id,
        type: 'post',
        callback: (data) => {
            let json = JSON.parse(data.text);
            console.log(json);
            callback(null, json);
            if(json.status == 200) {
                let _html = '<h1>'+item.name+'</h1>' + item.gem.gem_style.join(';');
                SendMail(_html);
            }
        }
    })
}

function getItemInfo({id, callback}) {
    FetchEvent({
        url: _G.C5.baseUrl + 'dota/' + id + '/S.html',
        callback: (data) => {
            let $ = cheerio.load(data.text);
            let img = $('.sale-item-img img').attr('src');
            let name = $('.sale-item-img img').attr('alt');
            callback && callback(img, name);
        }
    })
}

exports.getItemInfo = getItemInfo;

exports.GenerateTask = function({option, callback}) {
    switch (option.task) {
        case 'purchase':
            global.TaskHash[option.task + option.id] = new PurchaseClass(option);
            break;
        case 'buy':
            global.TaskHash[option.task + option.id] = new BuyClass(option);
            break;
    }

    global.TaskHash[option.task + option.id].init(callback);
}

exports.CancelTask = function({task, callback}) {
    global.TaskHash[task].switch = true;
    delete global.TaskHash[task];

    callback && callback();
}