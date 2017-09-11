const { app, dialog, shell, Menu, MenuItem, Tray, nativeImage } = require('electron')
const api = require('./main-api.js')
const { setting } = require('./server/setting')
let tray = null

function installTray() {    
    let trayIcon = nativeImage.createFromPath('./iconTemplate.png');
    tray = new Tray(trayIcon)
    tray.on('click', function(){
        // tray.window.hide();
    });
    if (process.platform  == 'win32') {
        const contextMenu = Menu.buildFromTemplate([
            {label: '退出', click: function(){
              app.quit();
            }},
          ])
          tray.setToolTip('TCoder...')
          tray.setContextMenu(contextMenu)
    }
}

function createAppMenu() {
    function openFile(filename) {
        api.openNewFile(filename);
    }
    function openRecentDocument(menu) {
        openFile(menu.label)
    }
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '打开...',
                    click: openFile,
                },
                {
                    label: '最近打开的项目',
                    submenu: (function () {
                        var menus = []
                        setting.recentDocuments.forEach(function (v, i) {
                            menus.push({ label: v, click: openRecentDocument })
                        })
                        return menus;
                    })()
                },
            ]
        },
        // {
        //     label: '查看',
        //     submenu: [
        //         {
        //             role: 'toggledevtools'
        //         }
        //     ]
        // },
        {
            label: '帮助',
            submenu: [
                {
                    label: '文档',
                    click() {
                        shell.openExternal(
                            `http://site.alibaba.net/rz.li/istyle/guide.html`
                        )
                    }
                }
            ]
        }
    ]


    if (process.env.NODE_ENV === 'development') {
        template.unshift({
            label: 'dev',
            submenu:[
                {role: 'toggledevtools'},                
            ]
        })
    }

    if (process.platform === 'darwin') {
        template.unshift({
            label: 'TCoder',
            submenu: [
                {
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        })

    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    installTray();

    
}


module.exports.createAppMenu = createAppMenu;