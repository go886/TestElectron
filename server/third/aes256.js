var aes256 = {},
    crypto = require('crypto')
//编码设置
var clearEncoding = 'utf8';
//加密方式
var algorithm = 'aes-256-ecb';
//向量
var iv = "";
//加密类型 base64/hex...
var cipherEncoding = 'base64';

aes256.encrypt = function (key, data) {
    var cipher = crypto.createCipheriv(algorithm, key, iv);
    var cipherChunks = [];
    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));
    return cipherChunks.join('');
};

aes256.decrypt = function (key, data) {
    var cipherChunks = [data];
    var decipher = crypto.createDecipheriv(algorithm, key, iv);
    var plainChunks = [];
    for (var i = 0; i < cipherChunks.length; i++) {
        plainChunks.push(decipher.update(cipherChunks[i], cipherEncoding, clearEncoding));
    }
    plainChunks.push(decipher.final(clearEncoding));
    return plainChunks.join('')
};

module.exports = aes256;

