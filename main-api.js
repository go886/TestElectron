const window = require('electron').BrowserWindow;
const ipcMain = require('electron').ipcMain
const path = require('path');

const dsl = require('./server/dsl');
const { config } = require('./server/setting')

var setting = config

var sender = null;
ipcMain.on('init', (event, arg) => {
    sender = event.sender;
    var args = { type: 'info', msg: '服务运行中' }
    sender.send('log', JSON.stringify(args))
});



module.exports = {
    sendMessage(args) {
        if (args && sender) {
            function isString(v) {
                return v && (typeof v === "string");
            }
            var msg = isString(args) ? args : JSON.stringify(args);
            msg = JSON.stringify({ type: 'info', msg: msg })
            sender.send('tips', msg)
        }
    },
    rebuild() {
        Object.keys(dsl.maping).forEach(function (k, i) {
            dsl.maping[k].parser();
        });
    },
    newProject(filename, cb) {
        if (filename && filename.length) {
            var r = dsl.parser(filename);
            if (!r.err) {
                setting.addRecentDocument(filename)
                setting.save()

                var name = path.dirname(filename).split('/').pop() + '/' + path.basename(filename, '.html');
                sender.send('newProject', JSON.stringify({ name: name, type: r.type }))
            }
        }
    },
    setting() {
        return setting;
    },
    openNewFile(file) {
        if (file) {
            this.newProject(file)
            return;
        }

        const { dialog } = require('electron')
        var paths = dialog.showOpenDialog(window.getFocusedWindow(), {
            properties: ['openFile'],
            filters: [{ name: 'html', extensions: ['html'] }]
        }, (paths) => {
            if (paths && paths.length) {
                this.newProject(paths[0])
            }
        });
    },
    enabledMock(enabled) {
        setting.mock = enabled;
        setting.save();
        this.rebuild();
    },
    enabledBorder(enabled) {
        setting.border = enabled;
        setting.save();
        this.rebuild();
    },
    openSetting() {
        const { shell } = require('electron')
        shell.openExternal('file://' + setting.path);
    },
    openqrcode() {
        const { shell } = require('electron')
        var url = setting.serverurl + '/js?uid=0';
        shell.openExternal(url);
    }
}