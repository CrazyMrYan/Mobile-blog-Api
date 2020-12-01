function getIPAddress() {
    let host;
    let interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                host = alias.address
                return host
            }
        }
    }
    return host
}

module.exports = getIPAddress;