<template>
    <div class='root'>

        <div class='tool'>
            <div class='toolleft'>
                <div class='toolitem' @click="onNewFile">
                    <span class="glyphicon glyphicon-file icon"></span>
                    <span class='itemtext'>新增</span>
                </div>
                <div class='toolitem' @click="onmock">
                    <span class="glyphicon glyphicon-check icon"></span>
                    <span class='itemtext' id='moc'>moc({{mock ? '开启' : '关闭'}})</span>
                </div>
                <div class='toolitem' @click="onBorder">
                    <span class="glyphicon glyphicon-text-height icon"></span>
                    <span class='itemtext'>border({{border ? '开启' : '关闭'}})</span>
                </div>
            </div>
            <div class='toolitem enditem' @click="onSetting">
                <span class="glyphicon glyphicon-certificate icon"></span>
                <span class='itemtext'>设置</span>
            </div>
        </div>  
        <Setting :value="settingitem"/>      
        <div class='content' id='content' ref="content"  @dragover='ondragover' @dragleave='ondragleave' @drop='ondrop'>
            <!-- <div class='qr' id='qr' :style="{visibility:isrunning ? 'visible': 'hidden'}">
                <div id='qrcode' style="background:white;" @click="onqrcode">
                    <qriously :value="qrcode" :size="245" />
                </div>
            </div> -->
            <div class="item" v-for="item in items">
                <img class="itemicon" id="itemicon" :src="item.icon" @click="onitemclick(item)" @contextmenu="oncontextmenu(item)">
                </img>
                <div class="itemtitle">{{item.name}}</div>
                <div class="itemmask" />

            </div>
            <div v-if="items.length == 0" class='dropproject' id='dropproject' ref='dropproject'>
                <span class="droptip" id='projectname'>{{projectName}}</span>
            </div>
        </div>

        <div class='bottom'>
            <div class="bottomtips">
                <span>{{serverurl}}</span>
            </div>
            <div class="glyphicon glyphicon-chevron-up up" @click="onShowLog"></div>
            <div class='wanring' id='tips' :style="{visibility:tips ? 'visible': 'hidden'}">{{tips}}</div>
            <textarea class='log' ref='log' :style="{visibility:openlog ? 'visible': 'hidden'}" disabled="disabled">{{log}}</textarea>
        </div>
        <!-- {{items}} -->
    </div>
</template>

<script>
    import Setting from './components/Setting'
    export default {
        name: 'app',
        components:{
            Setting,
        },
        data() {
            return {
                mock: true,
                border: false,
                qrschema: 'http://h5.m.taobao.com/ocean/ComponentList.htm',
                openlog: false,
                log: '',
                serverurl: location.href,
                isrunning: false,
                tips: null,
                projectName: 'Drop File Here',
                type: 'native',
                items: [],
                settingitem: null,
            }
        },
        computed: {
            // a computed getter
            qrcode: function () {
                var url = 'http://' + location.host + '/js?uid=0'
                var newUrl = this.qrschema;
                newUrl += (this.qrschema.indexOf('?') != -1) ? '&' : '?';
                newUrl += 'url=' + encodeURIComponent(url) + '&test=1';
                if (this.type === 'js') {
                    newUrl += '&type=js'
                }
                return newUrl;
            }
        },
        created() {
            document.ondragstart = function(e) {
                e.preventDefault();
                return false;
            }
            document.ondragover = document.ondrop = function (e) {
                e.preventDefault();
                return false;
            };

            this.qrschema = this.$.remoteApi.setting().qrschema;
            this.items = this.$.remoteApi.items();

            var setting = this.$.remoteApi.setting()
            this.$.ipc.on('tips', (event, arg) => {
                arg = JSON.parse(arg);
                this.showTips(arg.type, arg.msg);
            });

            this.$.ipc.on('log', (event, arg) => {
                arg = JSON.parse(arg);
                this.appendLog(arg.type, arg.msg);
            });
            this.$.ipc.on('newProject', (event, arg) => {
                arg = JSON.parse(arg);
                this.onProjectFinished(arg);
            });
            this.$.ipc.on('refresh', (event, args)=>{
                alert('refresh');
                this.refresh();
            });
            this.$.ipc.on('onSettingItem', (event, args)=>{
                this.settingitem = JSON.parse(args);
            });
            this.$.ipc.send('init');
        },
        methods: {
            onProjectFinished(project) {
                this.isrunning = true;
                this.projectName = project.name
                this.type = project.type;
            },
            onNewFile() {
                this.$.remoteApi.openNewFile(null);
            },
            onmock() {
                this.mock = !this.mock;
                this.$.remoteApi.enabledMock(this.mock);
            },
            onBorder() {
                this.border = !this.border;
                this.$.remoteApi.enabledBorder(this.border);
            },
            onSetting() {
                this.$.remoteApi.openSetting();
            },
            onShowLog() {
                this.openlog = !this.openlog;
            },
            onqrcode() {
                this.$.remoteApi.openqrcode();
            },
            ondragover() {
                this.$refs.content.className = 'hover'
                console.log()
            },
            ondragleave() {
                this.$refs.content.className = ''
            },
            refresh() {
                this.items = this.$.remoteApi.items();
            },
            ondrop(e) {
                this.ondragleave();
                e.preventDefault();

                let paths = [];
                const files = e.dataTransfer.files;
                for (var i = 0; i < files.length; ++i) {
                    paths.push(files[i].path)
                }
                this.$.remoteApi.addItems(paths);
                this.refresh();
                return false;
                function isAcceptFile(file) {
                    return file.lastIndexOf('.html') == file.length - '.html'.length
                }

                if (isAcceptFile(file.path)) {
                    this.showTips('info', '正在解析文件，请稍候...')
                    this.$.remoteApi.openNewFile(file.path);
                } else {
                    this.showTips('warning', '错误的文件类型，仅支持 html')
                    this.showTips('warning', file.path)
                }
                return false;
            },
            showTips(type, msg) {
                this.tips = msg;
                setTimeout(() => {
                    this.tips = null;
                }, 3000);
                this.appendLog(type, msg)
            },
            appendLog(type, msg) {
                const info = '[ ' + type + ' ]  ' + msg + '\n';
                this.log += info;
            },
            onitemclick(item) {
                this.$.remoteApi.openItem(item);
            },
            oncontextmenu(item) {
                this.$.remoteApi.oncontextmenu(item);
            }
        }
    }

</script>

<style scoped>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }


    .root {
        /*background-color: lightgray;*/
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 100%;
    }

    .tool {
        height: 80px;
        /*background-color: cadetblue;*/
        /*background-color: rgb(47, 176, 242);*/
        background-color: rgb(84, 139, 197);
        flex-direction: row;
        display: flex;
        align-content: center;
        /*padding-top: 50px;*/
        align-items: flex-end;
        padding-bottom: 10px;
        -webkit-app-region: drag;
        -webkit-user-select: none;
        /*拖动区域禁止选择*/
    }

    .toolleft {
        display: flex;
        flex-direction: row;
        align-content: center;
        flex: 1;
        margin-left: 10px;
    }

    .toolitem {
        -webkit-app-region: no-drag;
        padding: 4px 8px 4px 4px;
        margin-right: 6px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        /*height: 24px;*/
        color: antiquewhite;
    }

    .toolitem:hover {
        /*background-color: #428bca;*/
        background-color: rgb(47, 176, 242);
        color: white;
    }

    .enditem {
        justify-content: flex-end;
        /*-items: flex-end;*/
    }

    .icon {
        color: whitesmoke;
        font-size: 18px;
    }

    .itemtext {
        font-size: 12px;
        margin-left: 5px;
        text-align: center;
        cursor: default;        
    }

    .qr {
        justify-content: center;
        align-items: center;
        display: flex;

        /*visibility: hidden;*/
    }

    #qrcode:hover {
        cursor: pointer;
    }

    #content {
        flex: 1;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        /*align-items: center;*/
        /*justify-content: center;*/
        padding: 30px 0px 0px 20px;
        /*background-color: white;*/
        overflow-y: auto;
        align-items: flex-start;
        align-content: flex-start;


        /* background-color: red; */
    }

    #content.hover {
        background-color: grey;
    }

    #dropproject {
        margin: 30px 20px 0px 20px;
        border: 2px dashed grey;
        height: 100px;
        border-radius: 5px;
        justify-content: center;
        align-items: center;
        display: flex;
        -webkit-user-select: none;
    }

    #dropproject.hover {
        border-color: #2ab0cb;
    }

    .project {
        margin: 30px 20px 30px 20px;
        padding: 20px 20px 20px 20px;
        border: 2px dashed grey;
        height: 100px;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
    }

    .projectaction {
        display: flex;
        flex: 1;
        flex-direction: row;
    }

    .projectactionitem {
        width: 22px;
        height: 22px;
        margin-left: 12px;
    }

    .droptip {
        font-size: 20px;
        margin-right: 20px;
        color: lightslategrey;
        word-break: normal | break-all | keep-all;
    }

    .bottom {
        -webkit-user-select: none;
        display: flex;
        flex-direction: row;
        /*justify-content: center;*/
        align-items: center;
        height: 36px;
        background-color: rgb(250, 250, 250);
        font-size: 12px;
        /*color:darkblue;*/
        text-align: left;
        padding-left: 10px;
        padding-right: 10px;
        /*background-repeat: repeat-x;*/
        /*background-image: -webkit-linear-gradient(top, white 0, #f8efc0 100%);
        background-image: -o-linear-gradient(top, #fcf8e3 0, #f8efc0 100%);
        background-image: -webkit-gradient(linear, left top, left bottom, from(#fcf8e3), to(#f8efc0));
        background-image: linear-gradient(to bottom, #fcf8e3 0, #f8efc0 100%);*/
    }

    .bottomtips {
        flex: 1;
    }

    .log {
        text-shadow: 0 1px 0 rgba(255, 255, 255, .2);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .25), 0 1px 2px rgba(0, 0, 0, .05);
        background-color: #fcf8e3;
        background-image: -webkit-linear-gradient(top, #fcf8e3 0, #f8efc0 100%);
        background-image: -o-linear-gradient(top, #fcf8e3 0, #f8efc0 100%);
        background-image: -webkit-gradient(linear, left top, left bottom, from(#fcf8e3), to(#f8efc0));
        background-image: linear-gradient(to bottom, #fcf8e3 0, #f8efc0 100%);
        filter: progid: DXImageTransform.Microsoft.gradient(startColorstr='#fffcf8e3', endColorstr='#fff8efc0', GradientType=0);
        background-repeat: repeat-x;
        border: 1px solid transparent;
        /*border-radius: 4px;*/
        border-color: #f5e79e;
        /*padding-right: 35px;
        padding: 15px;*/
        padding: 4px 10px 4px 10px;
        /*padding: 0;*/
        position: fixed;
        bottom: 35px;
        left: 0px;
        /*right: 0px;*/
        height: 300px;
        width: 100%;
        color: #8a6d3b;
        font-size: 14px;
        resize: none;
    }

    .wanring {
        text-shadow: 0 1px 0 rgba(255, 255, 255, .2);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .25), 0 1px 2px rgba(0, 0, 0, .05);
        background-color: #fcf8e3;
        background-image: -webkit-linear-gradient(top, #fcf8e3 0, #f8efc0 100%);
        background-image: -o-linear-gradient(top, #fcf8e3 0, #f8efc0 100%);
        background-image: -webkit-gradient(linear, left top, left bottom, from(#fcf8e3), to(#f8efc0));
        background-image: linear-gradient(to bottom, #fcf8e3 0, #f8efc0 100%);
        filter: progid: DXImageTransform.Microsoft.gradient(startColorstr='#fffcf8e3', endColorstr='#fff8efc0', GradientType=0);
        background-repeat: repeat-x;
        border: 1px solid transparent;
        /*border-radius: 4px;*/
        border-color: #f5e79e;
        /*padding-right: 35px;
        padding: 15px;*/
        padding: 4px 10px 4px 10px;
        position: fixed;
        bottom: 36px;
        left: 0px;
        right: 0px;
        color: #8a6d3b;
        font-size: 14px;
    }

    .itemcontainer {
        background-color: red;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .item {
        width: 100px;
        margin-bottom: 20px;
        /* margin-right: 20px; */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        /* background-color: blue; */
        /* flex: 0; */
        -webkit-user-select: none;
    }

    #itemicon {
        width: 68px;
        height: 68px;
        flex: 0;
        /* max-height: 68px; */
        border-radius: 10px;
        border: 1px solid rgba(0, 0, 0, .05);

        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .25), 0 1px 2px rgba(0, 0, 0, .05);
        /* background-color: gray; */
        -webkit-transition: 0.3s;
        transition-timing-function: ease-out;
    }

    #itemicon:hover {
        -webkit-transform: scale(1.1);
        cursor: pointer;
    }

    

    .itemtitle {
        text-align: center;
        margin-top: 6px;
    }

    .itemmask {}
</style>