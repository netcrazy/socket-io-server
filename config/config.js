module.exports = {

    /**
     * redis 설정
     * @type {{host: string, port: number}}
     */
    redis_cfg: {
        host: "10.211.55.3",
        port: 6379,
        db: 0
    },

    /**
     * mysql 설정
     * @type {{host: string, user: string, password: string, database: string}}
     */
    mysql_cfg: {
        connectionLimit: 100,
        waitForConnections: false,
        host: '10.211.55.3',
        user: 'root',
        password: 'root',
        database: 'testdb'
    },

    /**
     * HMAC 시크릿키
     */
    hmac_secret: '0HEdY9+pzDBXPVq0t4mflMaYhxw9uNhdw/ynwQziLsM='
};