<template>
  <div class='root'>

    <div class='tool'>
      <div class='toolleft'>
        <div class='toolitem' onclick="openFile()">
          <span class="glyphicon glyphicon-file icon"></span>
          <text class='itemtext'>新增</text>
        </div>
        <div class='toolitem' onclick="onmock()">
          <span class="glyphicon glyphicon-check icon"></span>
          <text class='itemtext' id='moc'>moc(开启)</text>
        </div>
        <div class='toolitem' onclick="onBorder()">
          <span class="glyphicon glyphicon-text-height icon"></span>
          <text class='itemtext'>border(开启)</text>
        </div>
      </div>
      <div class='toolitem enditem' onclick="onSetting()">
        <span class="glyphicon glyphicon-certificate icon"></span>
        <text class='itemtext'>设置</text>
      </div>
    </div>

    <div class='content' id='drop'>
      <div class='qr' id='qr'>
        <img id='qrcode' src="/qrcode?uid=0" onclick='onqrcode()' />
      </div>
      <div class='dropproject' id='dropproject'>
        <text class="droptip" id='projectname'>Drop File Here</text>
        <!--<span class="glyphicon glyphicon-save"></span>-->
      </div>
      <div class='wanring' id='tips'>
      </div>
    </div>

    <div class='bottom'>
      <text class="bottomtips" id='bottomtips'></text>
      <div class="glyphicon glyphicon-chevron-up up" onclick="onShowLog()"></div>
      <textarea class='log' id='log' disabled="disabled"></textarea>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'app'
  }

</script>

<style scoped>
  html,
  body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    background-color: rgb(229, 239, 244);
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }

   
    .root {
        background-color: lightgray;
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
        visibility: hidden;
    }
    
    #qrcode:hover {
        cursor: pointer;
    }
    
    .content {
        flex: auto;
        display: flex;
        flex-direction: column;
        /*align-items: center;
        justify-content: center;*/
        padding: 30px 20px 50px 20px;
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
    
    .up {}
    
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
</style>