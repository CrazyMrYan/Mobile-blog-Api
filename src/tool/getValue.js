/**
 * 取出中括号内的内容
 * @param text
 * @returns {string}
 */
 function getBracketStr(text) {

    let result = ''
    let regex = /\{(.+?)\}/g;
    let options = text.match(regex)
    if (options) {
        let option = options[0]
        if (option) {
            result = option.substring(1, option.length - 1)
        }
    }
    return '{'+result+'}'
}
module.exports = getBracketStr