const mysql = require('mysql');
//创建链接池
var pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'User', //使用的数据库
    connectionLimit: 20 //设置连接池的数量
});

/**
 * Query 方法说明
 * @param {string} sql 语句
 * @param {array} params 请求参数
 * @reject {function} 失败返回
 * @resolve {function} 成功返回
 */

function Query(sql, params) {
    console.log(params)
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            //抛出错误
            if (err) {
                reject(err)
                return
            }
            conn.query(sql, params, (err, res) => {
                conn.release()
                if (err) {
                    reject(err)
                }
                resolve(res)
            })
        });

    })
}
module.exports = Query;