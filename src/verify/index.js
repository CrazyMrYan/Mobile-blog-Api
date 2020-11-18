/**
 * @author 严老湿
 * vKey 校验参数名是否正确
 * @param {Array} arr 接口所需要的字段
 * @param {Object} data 请求携带的参数
 * @return {Boolean} false || true 
 * @time 2020/11/12
 */

const vKey = function (arr, data) {
    var parameterError = true
    for (let i = 0; i < arr.length; i++) {
        if (!(arr[i] in data)) {
            parameterError = false
            return parameterError
        }
    }
    return parameterError
}

module.exports = vKey