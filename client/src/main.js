// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueQriously from 'vue-qriously'  

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'

Vue.use(ElementUI)
Vue.use(VueQriously);
Vue.use({
  install(Vue, options) {
    if(window.require){
      var __re_q = window.require
      const electron = __re_q('electron');
      const ipcRenderer = electron.ipcRenderer;
      const remote = electron.remote;
      const remoteApi = remote.require('./main-api.js');
      const setting = remote.require('./setting.json');

      //only explose these variable
      global.remoteApi = remoteApi;
      global.ipcRenderer = ipcRenderer;
      global.setting = setting;
    }
    //添加实例方法
    var p = Vue.prototype;
    p.$ = {
      ipc: global.ipcRenderer||{},
      remoteApi: global.remoteApi||{},
      setting: global.setting|{},
    }
  }
});

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
