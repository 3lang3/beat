'use strict';

var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport({
  service: 'QQ',
  auth: {
    user: '283876571@qq.com',
    pass: 'shcjdhnsozndbidh'
  }
})


module.exports = function(html, callback) {
    let o = {
        from: "283876571@qq.com", // 发件地址
        to: "675483520@qq.com", // 收件列表
        subject: html.title || "找到饰品", // 标题
        html: html.html // html 内容
    }
    smtpTransport.sendMail(o, (error, response) => {
        if(error){
            console.log(error);
            callback && callback(null, error);
        }else{
            console.log("Message send success...");
            callback && callback(null, response);
        }
        smtpTransport.close(); // 如果没用，关闭连接池
    });
}