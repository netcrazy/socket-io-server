var config  = require('../config/config');
var mysql   = require('mysql');

var pool = mysql.createPool(config.mysql_cfg);
module.exports = pool;