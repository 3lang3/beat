'use strict'

let tesseract = require('node-tesseract');
let cheerio = require('cheerio');
let superagent = require('superagent');
let async = require('async');
let _ = require('lodash');
let _G = require('./../base/base.config');
let fs = require('fs');
let https = require("https");
let Common = require('./../base/common');

// 下载验证码
function downloadImg({url, cookie, callback}) {
    let options = {
        method: 'GET',
        hostname: 'www.c5game.com',
        path: url,
        headers: {
            Cookie: cookie.join(';'),
            Referer: 'https://www.c5game.com/user/login/ajax.html'
        }
    };

    let Req = https.request(options, (res) => {
        let imgData = "";
        let imgName = url.split('?v=')[1] + '.png';

        res.setEncoding("binary"); 

        res.on("data", (chunk) => {
            imgData+=chunk;
        });

        res.on("end", () => {
            fs.writeFile(__dirname + './../public/images/captcha/' + imgName , imgData, "binary", (err) => {
                if(err) console.log("down fail");
                callback && callback(null, 'download success');
            });
        });
    });
    Req.end();
}
// get 登陆页面
function fetchLoginPage(callback) {
    Common.FetchEvent({
        url: 'https://www.c5game.com/user/login/ajax.html',
        callback: (data) => {
            let $ = cheerio.load(data.text);
            let captchaImg = $('#yw0').attr('src');
            let Cookies =  data.header['set-cookie'];

            callback(null, {captchaUrl: captchaImg, cookie: Cookies});
        }
    })
}
// 破解 验证码
function orcCaptchImg(obj, callback) {
    let imgName = obj.captchaUrl.split('?v=')[1] + '.png';

    async.waterfall([
        (_callback) => {
            downloadImg({
                url: obj.captchaUrl,
                cookie: obj.cookie,
                callback: _callback
            });
        },
        (t, _callback) => {
            tesseract.process('./public/images/captcha/' + imgName, (_e, text) => {
                if (_e) return console.error(_e); 
                _callback(null, text)
            });
        }
    ], (err, result) => {
        console.log(result.replace(/\s+/g, ''))
        callback(null, {captchaCode: result.replace(/\s+/g, ''), cookie: obj.cookie})
    })
}
// 提交登陆
function postAuth(obj, callback) {
    Common.FetchEvent({
        url: 'https://www.c5game.com/api/login.html',
        type: 'post',
        cookie: obj.cookie.join(';'),
        data: {
            'LoginForm[username]': '13071856973',
            'LoginForm[password]': 'z2316180100',
            'LoginForm[verify]': obj.captchaCode,
            'yt0': '登　录'
        },
        callback: (data) => {
            let res = JSON.parse(data.text);
            callback(null, {data: res, cookie: data.header['set-cookie'] })
        }
    })
}
// 整合登陆流程
function cycleCode(callback) {
    async.waterfall([
        fetchLoginPage,
        orcCaptchImg,
        postAuth
    ],(err, result) => {
        callback(null, result)
    })
}
// 若登陆不成功 重复登陆流程
function cycleAuth(callback) {
    let AuthStatus = false;
    console.log('enter login system')
    async.whilst(
        () => AuthStatus === false,
        (callback) => {
            async.waterfall([
                (_callback) => {
                    cycleCode(_callback)
                }
            ], (_e, _r) => {
                _r.data.status == 200 ? AuthStatus = true : AuthStatus = false;
                
                callback(null, _r)
            })
        }, (err, result) => {
            
            emptyCaptchaFile();
            callback(null, result)
        }
    )
}
// 登陆成功之后清除验证码图片
function emptyCaptchaFile() {
  let captchaFiles = __dirname + './../public/images/captcha';
  let folder_exists = fs.existsSync(captchaFiles);
  let files;

  if (folder_exists) {
    files = fs.readdirSync(captchaFiles);
    files.forEach((file) => {
      fs.unlinkSync(captchaFiles + '/' + file);
    })
  }
}
// 登陆成功后返回登陆cookie信息
function fetchLoginSystem(callback) {
    async.waterfall([
        cycleAuth
    ], (err, result) => {
        console.log(result);
        result.cookie.push('C5Machines=DpHNPZ%2FxieGRVQOgSzADvE3F8JvoKn93pBQPr1Qi%2BgY%3D; path=/; domain=.c5game.com; HttpOnly');
        result.cookie.push('C5Lang=zh; path=/; domain=.c5game.com; HttpOnly');
        callback && callback(result)
    })
}


module.exports = fetchLoginSystem;