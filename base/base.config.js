exports.C5 = {
    baseUrl: 'https://www.c5game.com/',
    saleUrl: 'https://www.c5game.com/api/product/sale.html',
    paymentUrl: 'https://www.c5game.com/api/order/payment.html',
    dotaUrl: 'https://www.c5game.com/dota.html',
    detailUrl: 'https://www.c5game.com/steam/item/detail.html',
    item: 'https://www.c5game.com/api/product/sale.html',
    purchaseUrl: 'https://www.c5game.com/api/product/purchase.html',
    purchaseItemInfo: 'https://www.c5game.com/api/purchase/item.html',
    purchaseSubmit: 'https://www.c5game.com/api/purchase/submit.html',
    purchaseList: 'https://www.c5game.com/user/purchase/index.html',
    purchaseCancel: 'https://www.c5game.com/api/purchase/cancel.html'
};

exports.Time = {
    fetchInterval: 2000
}

exports.FetchOption = {
    only: 'on'
}

exports.PurchaseOption = {
    price: '0.1'
}

exports.User = {
    id: 12301508
}

global.cookie = null;

global.PurchaseHash = {};
global.BuyHash = {};
global.TaskHash = {};