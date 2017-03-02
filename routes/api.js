var express = require('express');
var router = express.Router();

var config = require('../config/config');
var auth = require('../libraries/auth');

/* GET users listing. */
router.get('/', function(req, res, next) {

    var response = [
        { name: "최일규", age: "32"},
        { name: "홍길동", age: "42"}
    ];

    console.log(JSON.stringify(response, null, 2));

    //HMAC 인증 테스트
    var crypto = require('crypto')
        , text = '1484874839'
        , key = 'L3vD3YyzRLh3P7VF4blDLMZWK1IT1M249eXuvxj6XDw='
        , hash

    hash = crypto.createHmac('sha256', key).update(text).digest('base64');

    console.log(hash);

    res.send('respond with a resource');
});

/**
 * 디바이스 등록
 */
router.post('/device_register', function(req, res, next) {

    var json = req.body;
    if(Object.keys(json).length > 0) {
        var authMsg    = json.auth_msg;
        var authHash   = json.auth_hash;
        var deviceNo   = json.device_no;

        if(auth.isAppAuth(authMsg, authHash)) {

            console.log('Auth OK');
            //TODO 기기등록


            //OK
            res.json(json);

        } else {
            res.status(500).send({message:"인증에 실패하였습니다."});
        }
    } else {
        res.status(500).send({message:"필수 데이터가 누락되었습니다."});
    }
});



module.exports = router;
