const electron = require('electron');
const window = require('electron').BrowserWindow;
const { app, Menu, MenuItem, dialog, BrowserWindow, shell } = require('electron')

const ipcMain = require('electron').ipcMain
const fs = require('fs')
const path = require('path')
const md5 = require('md5')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync(path.join(electron.app.getPath('userData'), 'db.json'))
const db = low(adapter)
db.defaults({ items: [], user: {} })
    .write()

const dsl = require('./server/dsl');
const { config } = require('./server/setting')

var setting = config

var sender = null;
ipcMain.on('init', (event, arg) => {
    sender = event.sender;
    var args = { type: 'info', msg: '服务运行中' }
    sender.send('log', JSON.stringify(args))
});

function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function (err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function (err) {
        done(err);
    });
    wr.on("close", function (ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

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
    sendIpcMsg(msgType, args) {
        function isString(v) {
            return v && (typeof v === "string");
        }
        var msg = isString(args) ? args : JSON.stringify(args);
        sender.send(msgType, msg)
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
    },
    items() {
        var items = db.get('items').value() || [];
        items.forEach((item) => {
            item.icon = setting.serverurl + "/" + item.id + '.png?t=' + (new Date()).getTime();
        })
        return items;
    },
    openItem(item) {
        const { shell } = require('electron')
        shell.openExternal(item.exec);
    },
    addItems(paths) {
        paths.forEach((p, index) => {
            var fileinfo = path.parse(p)
            if (fileinfo.ext == '.app') {
                db.get('items').push({
                    type: '0',
                    id: md5(p),
                    name: fileinfo.name,
                    // icon: "http://127.0.0.1:8081/1.png",
                    path: p,
                    exec: 'file://' + p
                }).write();
            }
        })
    },
    oncontextmenu(item) {
        let template = [{
            label: "打开",
            click: () => {
                this.openItem(item);
            },
        }, {
            label: "浏览目录",
            click: () => {
                var fileinfo = path.parse(item.path)
                shell.openExternal('file://' + fileinfo.dir);
            },
        }, {
            label: "设置",
            click: () => {
                this.sendIpcMsg('onSettingItem', item);
                // this.openSetting(item);
                return;
                var paths = dialog.showOpenDialog(window.getFocusedWindow(), {
                    defaultPath: item.path,
                    properties: ['openFile'],
                    filters: [{ name: 'png', extensions: ['png'] }]
                }, (paths) => {
                    if (paths) {
                        var iconpath = paths[0];
                        var dest = path.join(electron.app.getPath('userData'), 'images')
                        dest = path.join(dest, item.id + '.png')
                        copyFile(iconpath, dest, (err) => {
                            if (!err) {
                                sender.send('refresh', null);
                            }
                        });
                    }
                });
            }
        }, {
            label: "test",
            click: () => {
                shell.openExternal('file://' + electron.app.getPath('userData'));

            }
        }
        ];

        var menu = Menu.buildFromTemplate(template)
        menu.popup(window.getFocusedWindow())
    }
}