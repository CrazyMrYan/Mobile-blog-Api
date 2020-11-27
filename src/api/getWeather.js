/**
 * Query 方法说明
 * @param {res} 返回对象
 * @param {cityName} 城市名称去除省|市|区|县
 */
const request = require('request');

function getWeather(res, cityName) {
    request('http://apis.juhe.cn/simpleWeather/query?city=' + encodeURI(cityName) + '&key=f33dd08f8c6c51164ffef3ddd5ae86d4',
        (err, response, body) => {
            if (!err && response.statusCode == 200) {
                // 返回对应参数
                let data = JSON.parse(body);
                data.code = 200;
                data.msg = '查询成功！';
                data.data = data.result;
                delete data.error_code;
                delete data.result;
                res.json(data)
            } else {
                res.status(500).json({ code: 500, msg: '服务端出现错误!' })
            }
        }
    )
}
module.exports = getWeather