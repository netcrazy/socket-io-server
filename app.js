var config = require('./config/config');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var api = require('./routes/api');

var app = express();
//var http = require('http').Server(app); // 추가
//var io = require('socket.io')(http); // 추가
app.io = require('socket.io')();

/**
 * socket.io에서 Clustering 데이터 처리를 위한 redis 셋팅
 * @type {*|Object}
 */
var ioRedis = require('socket.io-redis');
app.io.adapter(ioRedis({ host: config.redis_cfg.host, port: config.redis_cfg.port }));


/**
 * redis 클라이언트 (접속자 정보 기록용)
 * @type {exports|module.exports}
 */
var redis = require('redis');
var redisClient = redis.createClient(config.redis_cfg.port, config.redis_cfg.host);
app.cache = redisClient;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('socketio', app.io);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api', api);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);

  //res.status(404).send({message:"404 Not Found"});
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


console.log('app.js init..');


var connect_cnt = 0;

/*** Socket.IO 추가 ***/
app.io.use(function(socket, next) {

    //토큰을 받아 인증한다.
    if (socket.handshake.query && socket.handshake.query.deviceId){

        //TODO MySQL에서 로그인 인증을 거친다.
        if(socket.handshake.query.deviceId == 'ikchoi' && socket.handshake.query.secretKey == '1111') {
            console.log('deviceId=' + socket.handshake.query.deviceId);
            console.log('secretKey=' + socket.handshake.query.secretKey);
            next();
        } else {
            next(new Error('Authentication error'));
        }
    } else {
        next(new Error('Authentication error'));
    }

}).on('connection', function(socket) {

    console.log('connection ~~~~~~~~~~~~~~~~~~~~~~~~~');

    socket.on('login', function(data) {

        console.log('login ~~~~~~~~~~~~~~~~~~~~~~~~~' + data.deviceId);

        if(data.deviceId != undefined && data.deviceId != '') {

            /**
             * 디바이스ID를 저장한다.
             */
            socket.deviceId = data.deviceId;

            /**
             * 접속자 저장
             */
            redisClient.set(data.deviceId, socket.id, function (err, res) {
                if (err) return console.error(err);

                /**
                 * 접속자수를 구한다.
                 */
                redisClient.keys('*', function (err, keys) {
                    if (err) return console.error(err);

                    connect_cnt = keys.length;

                    /**
                     * 접속자 정보를 얻는다.
                     */
                    var connect_users = [];
                    for(var i=0; i < keys.length; i++) {
                        connect_users.push(keys[i]);
                    }
                    console.log(connect_users);

                    /**
                     * 서버로그에 접속알림
                     */
                    console.log(data.deviceId + '접속, 접속자수=' + connect_cnt);
                    console.log(socket.id + ' User connected (total:' + connect_cnt + ')');

                    /**
                     * 접속자를 제외한 나머지 참여자에게 알린다.
                     */
                    socket.broadcast.emit('chat message', data.deviceId + ' User connected (total:' + connect_cnt + ')');
                });

            });


        } else {
            console.log('deviceId 가 존재하지 않습니다.');
        }
    });



    /**
     * 특정 사용자에게 메시지 발송
     */
    socket.on('message special user', function(data) {

        redisClient.get(data.deviceId, function(err, reply) {
            if (err) return console.log(err);

            app.io.sockets.in(reply).emit('chat message', data.msg);
        });
    });

    /**
     * 클라이언트에서 메시지를 전달받아 소켓을 통해 메시지를 전달
     */
    socket.on('chat message', function(data) {
        if (data.deviceId == undefined || data.deviceId == '') return;

        console.log('deviceId: ' + data.deviceId);
        console.log('message: ' + data.msg);
        app.io.emit('chat message', '[' + data.deviceId + ']' + ' ' + data.msg);
    });

    /**
     * 브로드캐스트 채널을 통해 메시지를 전송한다. (나를 제외한 다른사람에게 메시지 전달)
     */
    socket.on('broadcast', function (msg) {
        socket.broadcast.emit('chat message', socket.id + ' ' + msg);
        console.log(socket.id + ' ' + msg);
    });





    /**
     * 나가기
     */
    socket.on('disconnect', function(){


        if(socket.deviceId != undefined) {
            /**
             * 삭제한다.
             */
            redisClient.del(socket.deviceId, function () {

                /**
                 * 접속자수를 구한다.
                 */
                redisClient.keys('*', function (err, keys) {
                    if (err) return console.log(err);

                    connect_cnt = keys.length;

                    /**
                     * 접속자 정보를 얻는다.
                     */
                    var connect_users = [];
                    for(var i=0; i < keys.length; i++) {
                        connect_users.push(keys[i]);
                    }
                    console.log(connect_users);


                    socket.broadcast.emit('chat message', socket.deviceId + ' User disconnected (total:' + connect_cnt + ')');
                    console.log(socket.deviceId + ' User disconnected');
                    console.log('접속자수' + connect_cnt);
                });

            });
        }
    });

});



module.exports = app;
