const { app, dialog, shell, Menu, MenuItem } = require('electron')
const api = require('./main-api.js')
const { setting } = require('./server/setting')

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
}


module.exports.createAppMenu = createAppMenu;