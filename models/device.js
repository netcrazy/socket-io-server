var config  = require('../config/config');
var pool    = require('../libraries/database');

module.exports = {
    getDeviceInfo: function (deviceId, callback) {

        var sql = `
            SELECT TITLE
              FROM BOARD
             WHERE 1=1
               AND BOARD_NO = ?
        `;

        pool.getConnection(function(err, connection) {
            connection.query(sql, deviceId, function (err, rows) {
                connection.release();
                return callback(err, rows);
            });
        });
    }
};