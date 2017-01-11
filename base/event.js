'use strict'

let cheerio = require('cheerio');
let superagent = require('superagent');
let async = require('async');
let _ = require('lodash');
let _G = require('./base.config');
let PurchaseClass = require('./../class/Purchase');
let BuyClass = require('./../class/Buy');
let SendMail = require('./../class/Mail');

function fetchGet({url, callback, cookie}) {
    superagent
        .get(url)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36')
        .set('Accept-Language', 'zh-CN,zh')    
        .set('Cookie', cookie || global.cookie)
        .timeout(5000)
        .end((err, datas) => {
            if (err) {
                console.log(url, 'call again!', err);
                return setTimeout(() => {
                    fetchGet({url, callback, cookie})
                }, 2000);
            }
            callback && callback(datas);
        })
}

function fetchPost({url, data, callback, cookie}) {
    superagent
        .post(url)
        .type('form')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36')
        .set('Accept-Language', 'zh-CN,zh')
        .set('Cookie', cookie || global.cookie)
        .send(data)
        .timeout(5000)
        .end((err, datas) => {
            if (err) {
                console.log(url, 'call again!');
                return setTimeout(() => {
                    fetchPost({url, data, callback, cookie})
                }, 2000);
            }
            callback && callback(datas);
        })
}

function getPageTotalNumber(url, callback) {
    fetchGet({
        url: url,
        callback: (data) => {
            let $ = cheerio.load(data.text),
            pageTotal = $('.pagination').length ? $('.pagination .last a').attr('href').replace(/[^0-9]/ig, "") : 1;

            callback && callback(null, pageTotal);
        }
    })
}

function getItemInfo(id, callback) {
    let _saleUrl = _G.C5.baseUrl + 'dota/' + id + '/S.html',
        _purchaseUrl = _G.C5.baseUrl + 'dota/' + id + '/P.html';

    async.parallel([
        (_c) => {
            fetchGet({
                url: _saleUrl,
                callback: (data) => {
                    let $ = cheerio.load(data.text),
                        obj = {
                            id: id,
                            saleID: $('[data-tpl="sale-tpl"]').attr('data-url').split('=')[1].split('&')[0],
                            image: $('.sale-item-img img').attr('src'),
                            name: $('.sale-item-img img').attr('alt'),
                            // saleCount: $('.sale-item-num').text().replace(/[^0-9]/ig, ""),
                            // salingCount: $('li[role="presentation"]').eq(0).text().replace(/[^0-9]/ig, ""),
                            // purchasingCount: $('li[role="presentation"]').eq(1).text().replace(/[^0-9]/ig, ""),
                            // marketPrice: $('.hero span').eq(0).text().split(':')[1]
                        };

                    _c(null, obj);
                }
            })
        },
        (_c) => {
            fetchGet({
                url: _purchaseUrl,
                callback: (data) => {
                    let $ = cheerio.load(data.text);
                    let purchaseID = $('[data-tpl="purchase-tpl"]').attr('data-url').split('?id=')[1].split('&')[0];
                    _c(null, purchaseID);
                }
            })
        }
    ], (err, result) => {
        let obj = result[0];
            obj.purchaseID = result[1];

        callback && callback(null, obj)
    })
}

function getApiDetails(url, callback) {
    fetchGet({
        url: url,
        callback: (data) => {
            let json = eval('(' + data.text + ')');
            console.log(url, json)
            callback && callback(null, json);
        }
    })
}

exports.C5Payment = function(item, callback) {
    fetchPost({
        url: _G.C5.paymentUrl + '?id=' + item.id,
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

exports.getFirstItem = function(id, type, callback) {
    let _url = type == 'sale' ? _G.C5.saleUrl + '?id=' + id : _G.C5.purchaseUrl + '?id=' + id;
    fetchGet({
        url: _url,
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

exports.GenerateTask = function({option, callback}) {
    switch (option.task) {
        case 'purchase':
            global.TaskHash[option.task + option.id] = new PurchaseClass(option);
            break;
        case 'buy':
            global.TaskHash[option.task + option.id] = new BuyClass(option);
            break;
        case 'bug':
            global.TaskHash[option.task + option.id] = new BuyClass(option);
    }

    global.TaskHash[option.task + option.id].init(callback);
}

exports.CancelTask = function({task, callback}) {
    global.TaskHash[task].switch = true;
    delete global.TaskHash[task];

    callback && callback();
}

exports.fetchGet = fetchGet;
exports.fetchPost = fetchPost;
exports.getPageTotalNumber = getPageTotalNumber;
exports.getItemInfo = getItemInfo;
exports.getApiDetails = getApiDetails;