import Vue from 'vue'
import VueResource from 'vue-resource'


//创建XMLHttpRequest对象       
function createXMLHttpRequest() {
    var XMLHttpReq = null;
    if (window.XMLHttpRequest) { //Mozilla 浏览器
        XMLHttpReq = new XMLHttpRequest();
    }
    else if (window.ActiveXObject) { // IE浏览器
        try {
            XMLHttpReq = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                XMLHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) { }
        }
    }

    return XMLHttpReq;
}
//get
function sendRequest(url) {
    r = createXMLHttpRequest();
    r.open('GET', url, false);
    r.send(null);
    return r;
}

function sendAyncRequest(url, processer) {
    r = createXMLHttpRequest();
    r.open('GET', url, true);
    r.onreadystatechange = function () { processer(r); };
    r.send(null);
}

function postRequest(url, data) {
    r = createXMLHttpRequest();
    r.open('POST', url, false);
    r.send(data);
    return r;
}

function postAsyncRequest(url, data, processer) {
    r = createXMLHttpRequest();
    r.open('POST', url, true);
    r.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    r.onreadystatechange = function () { processer(r); };
    r.send(data);
}


const IS_DEBUG = Vue.config.env //如果是测试环境就是true，如果是生产环境就是false
function GET(params) {
    Vue.http.options.credentials = true
    // Vue.http.options.emulateJSON = true;
    return Vue.http.get(METHOD, { params: params });
}
function POST(params) {
    Vue.http.options.credentials = true;
    Vue.http.options.emulateJSON = true;
    // Vue.http.options.emulateHTTP = true;
    return Vue.http.post(METHOD, params)
}

var DataSource = {
    test: function () {

        Vue.http.interceptors.push((request, next) => {
            next((response) => {
                console.log(response.headers)
                return response
            });
        });

        Vue.http.options.credentials = true;
        r.then((res) => {
        })
            .catch((res) => {
                // alert(res.headers.Location)
                console.log(JSON.stringify(res.headers));
            });
    },
    queryAll: function (pageNum) {
        return GET({
            action: 'sourceAction',
            event_submit_do_search_source: '1',
            pageNum: pageNum || 1
            // sourceId: -1
        });
    },
    query: function (id) {
        return GET({
            action: 'sourceAction',
            event_submit_do_query_source: '1',
            sourceId: id
        });
    },
    add: function (obj) {
        return POST({
            action: 'sourceAction',
            event_submit_do_add_source: '1',
            source: JSON.stringify(obj)
        });
    },
    delete: function (id) {
        return GET({
            action: 'sourceAction',
            event_submit_do_delete_source: '1',
            sourceId: id
        });
    },
    update: function (obj) {
        return POST({
            action: 'sourceAction',
            event_submit_do_update_source: '1',
            source: JSON.stringify(obj)
        });
    },
    publish: function (id, env) {
        return GET({
            action: 'sourceAction',
            event_submit_do_publish_source: '1',
            sourceId: id,
            env: env
        });
    }
}

var PageMgr = {
    getPageId: function () {
        return GET({
            action: 'PageAction',
            event_submit_do_generate_id: '1',
        });
    },
    queryAll: function (pageNum, env) {
        return GET({
            action: 'PageAction',
            event_submit_do_search_page: '1',
            env: env ? env : 0,//0,1 [预览、 正式]
            pageId: -1,
            pageNum: pageNum || 1
        });
    },
    query: function (id, env) {
        return GET({
            action: 'PageAction',
            event_submit_do_query_page: '1',
            env: env ? env : 0,//0,1 [预览、 正式]
            pageId: id,
        });
    },
    add: function (obj, env) {
        return POST({
            action: 'PageAction',
            event_submit_do_add_page: '1',
            env: env ? env : 0,//0,1 [预览, 正式]
            page: JSON.stringify(obj),
        });
    },
    delete: function (id, env) {
        return GET({
            action: 'PageAction',
            event_submit_do_delete_page: '1',
            env: env ? env : 0,//0,1 [预览、 正式]
            pageId: id,
        });
    },
    update: function (page, env) {
        return POST({
            action: 'PageAction',
            event_submit_do_update_page: '1',
            env: env ? env : 0,//0,1 [预览、 正式]
            page: JSON.stringify(page),
        });
    },
    publish: function (id, env) {
        return GET({
            action: 'PageAction',
            event_submit_do_publish_page: '1',
            env: env ? env : 0,//0,1 [预览、 正式]
            pageId: id,
        });
    },
}


export {
    DataSource, PageMgr
}