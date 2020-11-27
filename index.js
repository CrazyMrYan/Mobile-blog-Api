const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path')
var uuid = require('node-uuid');
const qs = require('querystring');
const jwt = require("jsonwebtoken")
const url = require('url');
const bodyParser = require("body-parser");
const Query = require('./src/tool/query');
const expressJwt = require('express-jwt')
const { PWD, TOKEN_KEY, TIME } = require('./src/tool/token');
const vKey = require('./src/verify')
const city = require('./src/city')
const request = require('request');

// 解析 callback 参数
const getBracketStr = require('./src/tool/getValue');
// 聚合天气 api
const getWeather = require('./src/api/getWeather')
// 设置请求的参数格式
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


//设置跨域访问
app.all("*", function (req, res, next) {
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin", "*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers", "*");
    //跨域允许的请求方式 
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    // res.sendStatus(200)
    if (req.method.toLowerCase() == 'options') {
        res.sendStatus(200);  //让options尝试请求快速结束
    } else
        next();
})

app.use(expressJwt({
    secret: TOKEN_KEY,
    // 2020.7.7日jwt更新之后 需要设置algorithms属性
    algorithms: ['HS256']
}).unless({
    //白名单,除了这里写的地址，其他的URL都需要token验证
    path: ['/api/user/register', '/api/user/login']
}));

// 全局拦截
app.use((err, req, res, next) => {
    let token = req.headers.authorization;
    if (token) {
        jwt.verify(token, TOKEN_KEY, (err, decoded) => {
            if (err) {
                switch (err.name) {
                    case 'JsonWebTokenError':
                        res.status(403).send({ code: -1, msg: 'token不存在' });
                        break;
                    case 'TokenExpiredError':
                        res.status(403).send({ code: -1, msg: 'token过期' });
                        break;
                }
            } else {
                next()
            }
        })
    } else {
        res.status(403).send({ code: -1, msg: 'token不存在' });
    }
})

// 登录
app.post('/api/user/login', async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let arr = ['name', 'pwd'];
    //获取前端传过来的参数
    if (vKey(arr, req.body)) {
        let { name, pwd } = req.body;
        try {
            //和数据库对比
            let user = await Query('select * from user where name = ? and pwd = ?', [name, pwd]);
            if (!user || user.length == 0) {
                res.json({ code: -1, msg: '账号或者密码错误!' })
            } else {  //如果正确
                //创建token   jwt.sign方法第一个参数可以存储信息 ,第二个参数存储token密钥 第三个是token过期时间
                let token = jwt.sign({ name }, TOKEN_KEY, { expiresIn: TIME })
                res.send({ code: 200, msg: '登录成功!', token: token })
            }
        } catch (e) {
        }
    } else {
        res.send({ code: 400, msg: '参数名不对!' })
    }

})

// 注册
app.post('/api/user/register', async (req, res) => {
    if ('name' in req.body && 'pwd' in req.body) {
        let { name, pwd } = req.body;
        try {
            // 判断是否存在数据库
            let user = await Query('select * from user where name  =  ?', [name]);
            if (!user || user.length == 0) {
                let data = [name, pwd, uuid.v1()]
                //插入数据
                await Query('INSERT INTO user(name,pwd,id) VALUES(?,?,?)', data).then(
                    result => {
                        res.json({ code: 200, msg: '注册成功!' });
                    }
                ).catch(err => {
                    res.json(err)
                })
            } else {
                res.json({ code: -1, msg: '该账号已存在!' });
            }
        } catch (err) {
            console.log(err)
        }
    } else {
        res.send({ code: 400, msg: '参数名不对!' })
    }
})

// 删除用户
app.delete('/api/delete/user', async (req, res, next) => {
    if ('name' in req.body) {
        let { id } = req.body;
        let data = await Query('select * from user where id  =  ?', [id]);
        if (!data || data.length == 0) {
            res.json({ code: -1, msg: '当前id不存在!' });
        } else {
            await Query('DELETE FROM user WHERE id = ?', [id]).then(
                result => {
                    res.json({ code: 200, msg: '删除成功！' });
                }
            ).catch(error => {
                res.json(error)
            })
        }
    } else {
        res.send({ code: 400, msg: '参数名不对!' })
    }

})

// 获取 pyq 所有信息
app.get('/api/space/list', async (req, res, next) => {
    let { pageSize, pageIndex, id } = req.body;

    // await Query('INSERT INTO user(name,pwd,id) VALUES(?,?,?)', data).then(
    //     result => {
    //         res.json({ code: 200, msg: '注册成功!' });
    //     }
    // ).catch(err => {
    //     res.json(err)
    // })
})

// 发布 pyq
app.post('/api/push/pyq', async (req, res, next) => {
    // param 是你需要的参数 写成一个数组传递
    let param = ['userId', 'img', 'text'];
    if (vKey(param, req.body)) {
        let { userId, img, text } = req.body;
        let data = [userId, img, text, uuid.v1()]
        await Query('INSERT INTO pyq(img,id,text,userId) VALUES(?,?,?,?)', data).then(
            result => {
                res.json({ code: 200, msg: '发布成功！' });
            }
        ).catch(error => {
            console.log(error)
        })
    } else {
        res.send({ code: 400, msg: '参数名不对!' })
    }
})

// 发布 blog
app.post('/api/push/blog', async (req, res, next) => {
    // param 是你需要的参数 写成一个数组传递
    let param = ['title', 'content', 'author'];
    if (vKey(param, req.body)) {
        let { title, content, author } = req.body;
        let data = [title, content, author, uuid.v1()]
        await Query('INSERT INTO blog(title,content,author,id) VALUES(?,?,?,?)', data).then(
            result => {
                res.json({ code: 200, msg: '发布成功！' });
            }
        ).catch(error => {
            console.log(error)
        })
    } else {
        res.send({ code: 400, msg: '参数名不对!' })
    }
})


// 获取列表接口
app.post('/api/blog/list', async (req, res, next) => {
    // param 是你需要的参数 写成一个数组传递
    let param = ['keyword', 'pageSize', 'pageIndex'];
    if (vKey(param, req.body)) {
        let { keyword, pageSize, pageIndex } = req.body;
        let data = [keyword, pageSize, pageIndex]
        let KeyString = "'%" + keyword + "%'"
        let sql = !!!keyword ? 'SELECT * FROM blog  limit ' + pageSize * pageIndex + ',' + pageSize : 'SELECT * FROM blog WHERE title LIKE ' + KeyString + ' limit ' + pageSize * pageIndex + ',' + pageSize
        await Query(sql).then(
            result => {
                res.json({ code: 200, msg: '查询成功！', data: result });
            }
        ).catch(error => {
            console.log(error)
        })
    } else {
        res.send({ code: 400, msg: '参数名不对!' })
    }
})

app.post('/api/blog/details', async (req, res, next) => {
    // param 是你需要的参数 写成一个数组传递
    let param = ['id'];
    if (vKey(param, req.body)) {
        let { id } = req.body;
        let data = await Query('select * from blog where id  =  ?', [id]);
        res.json({ code: 200, msg: '查询成功！', data: data[0] });
    } else {
        res.send({ code: 400, msg: '参数名不对!' })
    }
})

// 查询当地天气预报
app.post('/api/cityWeather', async (req, res, next) => {
    if (!!req.body.city) {
        let cityName = req.body.city.replace(/市|县|区|省/g, '')
        getWeather(res, cityName)
    } else
        // 调用搜狐 api 获取当前城市地区代码
        request('http://pv.sohu.com/cityjson?ie=utf-8', (err, response, data) => {
            // 将callback参数解析
            let cityInfo = getBracketStr(data + '');

            // 遍历本地城市数据
            city.forEach(item => {
                // 拿到相同 cid 取当前对象中的name参数
                if (item.REGIONCODE == JSON.parse(cityInfo).cid) {
                    let cityName = item.REGIONNAME
                    // 截取城市字符串
                    item.cityName = cityName.replace(/市|县|区|省/g, '')
                    // 调取聚合数据 api 城市天气
                    getWeather(res, item.cityName)
                    return false
                }
            })
        })

})

function getIPAddress() {
    let interfaces = require('os').networkInterfaces(), host;
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                host = alias.address;
                return host;
            }
        }
    }
    return host;
}
app.listen(8080, () => {
    console.log('服务启动' + getIPAddress() + ':8080')
    // console.log('------------------------ 端口号为 8080 ------------------------')
})