const path = require("path")
const fs = require('fs')
const electron = require('electron');

function localIp() {
    var os = require('os');
    var IPv4, hostName;
    hostName = os.hostname();
    var net = os.networkInterfaces();
    var en = net.en0 ? net.en0 : net.en1;
    for (var i = 0; i < en.length; i++) {
        en.forEach(function (v, index) {
            if (v.family == 'IPv4') {
                IPv4 = v.address;
            }
        });
    }


    return IPv4
}

const configPath = path.join(electron.app.getPath('userData'), 'config.json')
var setting = (function () {
    var setting = null;
    try {
        var content = fs.readFileSync(configPath, 'utf8')
        if (content) {
            setting = JSON.parse(content)
        }
    } catch (error) {

    }


    if (!setting) {
        setting = {
            mock: true,
            border: false,
            qrschema: 'http://h5.m.taobao.com/ocean/ComponentList.htm',
            configPath: configPath,
            recentDocuments: [],
            port : 8081,
            version: '0.0.1'
        };

        
    }

    if (!setting.port) {
        setting.port = 8081;
    } 
    if (!setting.version) {
        setting.version = '0.0.1';
    }


    function unique(array) {
        var n = [];//临时数组
        for (var i = array.length -1; i >=0; i--) {
            if (n.indexOf(array[i]) == -1) n.push(array[i]);
        }
        return n;
    }

    setting.recentDocuments = unique(setting.recentDocuments)

    return setting;
}
)();


setting.path = configPath;
setting.addRecentDocument = function (filename) {
    this.recentDocuments.push(filename);
}

setting.save = function () {
    var jsonstring = JSON.stringify(this, null, 4);
    fs.writeFile(configPath, jsonstring);
}
setting.serverurl = 'http://' + localIp() + ':' + setting.port;

module.exports = {
    config:setting,
    setting,
}