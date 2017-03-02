module.exports = {

    /**
     * redis 설정
     * @type {{host: string, port: number}}
     */
    redis_cfg: {
        host: "redis.hostname",
        port: 6379
    },

    /**
     * mysql 설정
     * @type {{host: string, user: string, password: string, database: string}}
     */
    mysql_cfg: {
        connectionLimit: 100,
        waitForConnections: false,
        host: 'db.hostname',
        user: 'username',
        password: 'password',
        database: 'databasename'
    },

    /**
     * HMAC 시크릿키
     */
    hmac_secret: '0HEdY9+pzDBXPVq0t4mflMaYhxw9uNhdw/ynwQziLsM='
};