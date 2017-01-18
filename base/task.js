'use strict';

let BuyClass = require('./../class/Buy');
let PurchaseClass = require('./../class/Purchase');
let BugClass = require('./../class/Bug');

exports.generate = function({option, callback}) {
    switch (option.task) {
        case 'purchase':
            console.log('purchase')
            global.TaskHash[option.task + option.id] = new PurchaseClass(option);
            break;
        case 'buy':
            console.log('buy')
            global.TaskHash[option.task + option.id] = new BuyClass(option);
            break;
        case 'bug':
            console.log('bug')
            global.TaskHash[option.task + option.id] = new BugClass(option);
            break;
    }
    global.TaskHash[option.task + option.id].init(callback);
}

exports.cancel = function({task, callback}) {
    global.TaskHash[task].switch = true;
    delete global.TaskHash[task];

    callback && callback();
}