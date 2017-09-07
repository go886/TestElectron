
isFunction = function (v) {
    var getType = {};
    return v && getType.toString.call(v) == '[object Function]';
};

var TNodeService = {
    register: function (name, service) {
        name = '$' + name;
        if (!this[name] && service) {
            this[name] = service
        }
    },
    unregister: function (name) {
        name = '$' + name;
        delete this[name]
    },
    invoke: function (url, args, callback) {
        var r = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
        var match = url.match(r);

        function parseQuery(str) {
            var theRequest = new Object();
            if (str.indexOf("&") != -1) {
                strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                }
            } else {
                theRequest[str.split("=")[0]] = unescape(str.split("=")[1]);
            }
            return theRequest;
        }
        var URL = {
            url: url,
            schema: match[1],
            slash: match[2],
            host: match[3],
            port: match[4],
            path: match[5],
            query: parseQuery(match[6]),
            hash: match[7]
        }



        var service = this['$' + URL.schema];
        if (service) {
            var method = service[URL.host]
            if (method && isFunction(method)) {
                method.call(service, args || URL.query, callback);
            }
        }

        return null;
    }
};



TNodeService.register('mtop', require('./mtop').mtop)
TNodeService.register('modal', require('./modal').modal)
TNodeService.register('share', require('./share').share)
TNodeService.register('follow', require('./follow').follow)
TNodeService.register('follow', require('./'))




TNodeService.$mtop.send({ method: 'xxx', args: { type: 1 } }, (res) => {
    TNodeNativeService.sendMessage({ msg: 'openurl', args: {}, callback: null });
});



//Native 
/**
 * 
 * @param {*} msg 
 */
function sendMessage(msg) {

}



var mtop = require_t('mtop');
mtop.send()