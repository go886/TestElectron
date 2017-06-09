
# electron 环境搭建
- 安装 electron 
```
  npm install --g electron
```
-  改变目录owner 权限 【可选】
```
  sudo chown -R 用户名 /usr/local
```

- 安装打包程序 
```
 npm install -g electron-packager
```
- 创建项目
```
mkdir TestElectron  
cd TestElectron
npm init
```

- 安装开发环境依赖
```
npm install --save-dev electron
npm install  --save-dev electron-packager
```
- 添加 main.js index.html 文件  
	*main.js*   
	**index.html**

- 设置 package.json 启动脚本
```
{
  "name": "testelectron",
  "version": "1.0.0",
  "description": "",
  "main": "main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "electron .",
    "pack": "electron-packager . TestElectron --out=dist --overwrite --ignore=node_modules/electron-* --ignore=node_modules/.bin --ignore=.git --ignore=dist --icon=icon.icns"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "electron": "^1.6.10",
    "electron-packager": "^8.7.1"
  }
}

```
 

- 设置 vscode 启动脚本
```
{
    // 使用 IntelliSense 以学习相关的 Node.js 调试属性。
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Electron Main",
            "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/electron",
            "windows": {
                "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/electron.cmd"
            },
            "program": "${workspaceRoot}/main.js",
            "protocol": "legacy"
        },
    ]
}
```
- client 代码
```
cd client
npm run build
```