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
                if(!!data.result){
                    data.data = data.result;
                    let T = data.data.realtime.temperature;
                    let clothing;
                    if(T > 28){
                        clothing = '轻棉织物制作的短衣、短裙、薄短裙、短裤'
                    }else if(T >= 24.0 && T <= 27.9){
                        clothing = '棉麻面料的衬衫、薄长裙、薄T恤'
                    }else if(T >= 21.0 && T <= 23.9){
                        clothing = '单层棉麻面料的短套装、T恤衫、薄牛仔衫裤、休闲服、职业套装'
                    }else if(T >= 18.0 && T <= 20.9){
                        clothing = '套装、夹衣、风衣、休闲装、夹克衫、西装、薄毛衣'
                    }else if(T >= 15.0 && T <= 17.9){
                        clothing = '风衣、大衣、夹大衣、外套、毛衣、毛套装、西装、防寒服 '
                    }else if(T >= 11.0 && T <= 14.9){
                        clothing = '毛衣、风衣、毛套装、西服套装 '
                    }else if(T >= 6.0 && T <= 10.9){
                        clothing = '棉衣、冬大衣、皮夹克、厚呢外套、呢帽、手套、羽绒服、皮袄'
                    }else if(T < 6){
                        clothing = '棉衣、冬大衣、皮夹克、厚呢外套、呢帽、手套、羽绒服、皮袄'
                    }
                    data.data.realtime.clothing = clothing;
                    delete data.error_code;
                    delete data.result;
                    res.json(data)
                }else{
                    res.json(data)
                }
                
            } else {
                res.status(500).json({ code: 500, msg: '服务端出现错误!' })
            }
        }
    )
}
module.exports = getWeather