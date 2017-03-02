var config = require('../config/config');
var crypto = require('crypto');

module.exports = {
    /**
     * 메시지 인증을 위한 HMAC (with SHA256) 해시값 생성
     * @param message
     * @returns {*}
     */
    hmacHash: function (message) {
        return crypto.createHmac('sha256', config.hmac_secret).update(message).digest('base64');
    },
    /**
     * HMAC REST-API 인증
     * @param message
     * @param hash
     * @returns {boolean}
     */
    isAppAuth: function (message, hash) {

        var now = new Date();
        var date = new Date(message * 1000);

        var diff = now.getTime() - date.getTime();
        var exp_minute = diff / 1000 / 60;

        if (this.hmacHash(message) === hash && exp_minute < 10) {
            return true;
        } else {
            return false;
        }
    }
};