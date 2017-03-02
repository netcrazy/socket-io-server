var config = require('../config/config');
var express = require('express');
var router = express.Router();
var deviceModel = require('../models/device');

console.log('index.js init..');


/* GET home page. */
router.get('/console', function(req, res, next) {
    var url = 'index';
    var options = { title : 'Express wow~~~'};

    /*
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    */
    var deviceId = 14;

    deviceModel.getDeviceInfo(deviceId, function (err, rows) {
        if (err) {
            console.error(err);
            next(err);
            return;
        }

        var result = {
            'options'   : options,
            'rows'      : rows
        };
        res.render(url, result);

    });


});


/**
 * redis 테스트
 */
router.get('/redis', function(req,res, next) {

    /**
     * redis client 객체를 얻는다.
     * @type {*|redisClient}
     */
    var cache = req.app.cache;

    req.accepts('application/json');

    var key = 'ikchoi';
    var value = JSON.stringify({name:'최일규', age: '41'});


    /**
     * redis set
     */
    cache.set(key,value,function(err,data){
        if(err){
            console.log(err);
            res.send("error "+err);
            return;
        }

        //데이터는 60초에 자동 expire 됨
        cache.expire(key, 60);

    });


    /**
     * redis get
     */
    cache.get(key,function(err,data){
        if(err){
            console.log(err);
            res.send("error "+err);
            return;
        }

        var value = JSON.parse(data);
        res.json(value);
    });


});

module.exports = router;
