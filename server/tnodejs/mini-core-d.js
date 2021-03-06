
; (function (global, module) {
    // 'use strict';
    if (!global.global) global.global = global;

    {
        var env = module.env || { debug: true, nodejs: (typeof console !== 'undefined'), system: { os: 'iOS' } }
        env.debug = env.debug || false;
        global.$ = env;
    }

    global.isFunction = function (v) {
        var getType = {};
        return v && getType.toString.call(v) == '[object Function]';
    };

    global.isString = function (v) {
        return v && (typeof v === "string");
    }

    global.isObject = function (o) {
        return o instanceof Object
    }
    global.assert = function (condition) {
        if (global.$.debug == true && !condition) {
            var msg = 'Assertion failed ';
            for (var i = 1; i < arguments.length; i++) {
                msg = msg + arguments[i].toString();
            };
            console.log(msg);
            if (typeof Error !== "undefined") {
                throw new Error(msg);
            }
            throw msg;
        }
    }


    //Module 
    global.Module = function (code) {
        const __modulesMap = {};
        function requierBuilder(code) {
            if (isString(code)) {
                code = "return (function(module, exports, require){" + code + "})";
                return (new Function(code))();
            } else if (isObject(code)) {
                return (function (module, exports, require) {
                    extend(exports, code);
                });
            }
            assert(false, 'requierBuilder error:', code);
        }
        function _find(id) {
            return __modulesMap[id];
        }

        function md5(s) {
            return s;
        }

        function requireImp(modulefilename) {
            const __filename = modulefilename;

            function resolve(p) {
                if (!p) return p;
                if ('/' === p[0]) return p;
                var parent = __filename;
                var path = parent.split('/');
                var segs = p.split('/');
                path.pop();

                for (var i = 0; i < segs.length; i++) {
                    var seg = segs[i];
                    if ('..' == seg) path.pop();
                    else if ('.' != seg) path.push(seg);
                }

                return path.join('/');
            }

            var _ = function (name, content) {
                var filename = resolve(name);
                var id = md5(filename);
                var module = _find(id);
                if (!module) {
                    try {
                        module = {
                            id: id,
                            name: name,
                            filename: filename,
                            loaded: false,
                            require: requireImp(filename),
                            findModule: _find,
                            exports: { id: id },
                        };

                        console.log('load module:', module.filename, name);
                        __modulesMap[module.id] = module;

                        var m = content;
                        if (!isFunction(content)) { // global module...
                            m = requierBuilder(TNodeEngine.loadModule(name));
                        }

                        if (isFunction(m)) {
                            m.call(module, module, module.exports, module.require);
                        }

                        module.loaded = true;
                        if (isFunction(module.exports.ready)) {
                            module.exports.ready();
                        }
                    } catch (e) {
                        delete __modulesMap[module.id];
                        var msg = {
                            id: module.id,
                            name: module.name,
                            filename: module.filename,
                            msg: e.message,
                            info: e,
                        }
                        console.log('error msg:', msg);
                        assert(false, e);
                    }
                }
                return module.exports || {};
            }

            _.resolve = resolve;
            _.findModule = _find;

            return _;
        }
        try {
            var exports = requireImp('/')('/', requierBuilder(code));
        } catch (error) {
            console.log('error:', error);
        }
        return _find(exports ? exports.id : 0);
    }



    // init TNodeEngine
    {
        if (typeof global.console === 'undefined') {
            global.console = {}
        }
        if (typeof _OC_log !== 'undefined') {
            global.console.log = function () {
                if (true != global.$.debug) return;
                return _OC_log(arguments);
            }
        }
        if (!global.__weakOf || true) {
            global.__weakOf = function (v) {
                return (function () { return v; })
            }
        }

        if (!global.TNodeEngine) {
            global.TNodeEngine = {
                'makeNode': function () {

                },
                'setAttr': function (nodeId, k, v) {

                },
                'setStyle': function (nodeId, k, v) {

                },
                'insertSubNodesAtIndex': function (nodeId, srcIndexs, indexs) {
                },
                'removeSubNodesAtIndexs': function (nodeId, indexs) {

                },
                'replaceSubNodesAtIndexs': function (nodeId, nodeIds, dstIndexs) {

                },
                'postMessage': function (nodeId, args) {

                },
                'loadModule': function (name) {
                    try {
                        return require(name);
                    } catch (error) {
                        return require('./' + name);
                        // const fs = require('fs')
                        // var path = './tnodejs/' + name + '.js'
                        // var code = fs.readFileSync(path, 'utf8');
                        // return code;
                    }
                },
                'addNode': function () {

                },
            }
        } else {

            if (!global.TNodeEngine.loadModule) {
                global.TNodeEngine.loadModule = function () {
                    assert(false, 'native engine loadModule not imp..')
                };
            }

            if (global.$.system.os === 'Android') {
                global.TNodeEngine.nodesMap = {}
                global.TNodeEngine.handleEvent = function (nodeId, method, args) {
                    var node = global.TNodeEngine.nodesMap[nodeId];
                    if (node) {
                        node.$onEvent(method, args);
                    }
                }
                global.TNodeEngine.addNode = function (node) {
                    global.TNodeEngine.nodesMap[node.nodeId] = node
                }
            } else {
                global.TNodeEngine.addNode = function () {

                }
            }
        }

        global.TNodeEngine.callId = 0;
        global.TNodeEngine.handlersMap = {}
        global.TNodeEngine.callNative = function (module, method, params, callback) {
            if (module && method) {
                var callId = null;
                if (callback) {
                    callId = this.callId++;
                    this.handlersMap[callId] = callback;
                }
                const callNative = this._callNative;
                if (callNative) {
                    callNative({
                        'moduleId': module.name,
                        'method': method,
                        'args': params,
                        'callId': callId,
                    });
                }
            }
        }

        global.TNodeEngine.callJS = function (callId, args) {
            var method = this.handlersMap[callId];
            if (method && isFunction(method)) {
                method(args);
                delete this.handlersMap[callId];
            }
        }
    }
    console.log('TNode env:', global.$)



    global.stringify = function (x) {
        return typeof x === 'undefined' || x === null
            ? ''
            : typeof x === 'object'
                ? x instanceof RegExp
                    ? x.toString()
                    : x instanceof Date
                        ? JSON.parse(JSON.stringify(x))
                        : JSON.stringify(x)
                : x.toString()
    }
    /***/
    function def(obj, key, val, enumerable) {
        Object.defineProperty(obj, key, {
            value: val,
            enumerable: !!enumerable,
            writable: true,
            configurable: true
        })
    }

    function enabledEnumerables(obj, keys, enumerable) {
        keys.forEach(function (key) {
            def(obj, key, obj[key], enumerable);
        });
    }

    function indexOf(arr, obj) {
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] === obj) return i
        }
        return -1
    }


    var uid = 0;
    function Dep(key) {
        this.id = uid++;
        this.key = key;
        this.subs = [];
        this.addSub = function (sub) {
            this.subs.push(sub);
        }
        this.notify = function () {
            var args = arguments;
            this.subs.forEach(function (sub) {
                sub.update.apply(sub, args);
            });
        }
    }
    //Dep.target  的是watcher
    Dep.target = null


    var arrayProto = Array.prototype;
    var arrayMethods = Object.create(arrayProto);

    [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'sort',
        'reverse'
    ]
        .forEach(function (method) {
            // cache original method
            var original = arrayProto[method]
            def(arrayMethods, method, function mutator() {
                // avoid leaking arguments:
                // http://jsperf.com/closure-with-arguments
                var i = arguments.length
                var args = new Array(i)
                while (i--) {
                    args[i] = arguments[i]
                }
                var result = original.apply(this, args)
                var ob = this.__ob__
                var inserted
                switch (method) {
                    case 'push':
                        inserted = args
                        break
                    case 'unshift':
                        inserted = args
                        break
                    case 'splice':
                        inserted = args.slice(2)
                        break
                }
                if (inserted) ob.observeArray(inserted)
                // notify change
                ob.notify(this, method, args);
                return result
            })
        })

    def(
        arrayProto,
        '$set',
        function $set(index, val) {
            if (index >= this.length) {
                // this.length = index + 1
                index = this.length;
            }
            return this.splice(index, 1, val)[0]
        }
    )


    def(
        arrayProto,
        '$remove',
        function $remove(index) {
            /* istanbul ignore if */
            if (!this.length) return
            if (typeof index !== 'number') {
                index = indexOf(this, index)
            }
            if (index > -1) {
                this.splice(index, 1)
            }
        }
    )


    function extend(to, from, deep) {
        if (to === from || !from) return to;
        if (!deep) {
            for (var key in from) {
                to[key] = from[key]
            }
        } else {
            var statck = []
            statck.push([to, from])
            function _extern(to, from, list) {
                for (var key in from) {
                    var o = to[key];
                    var o1 = from[key];
                    if (isObject(o1) && !isFunction(o1)) {
                        if (!isObject(o)) {
                            if (Array.isArray(o1)) {
                                var newList = []
                                to[key] = newList;
                                o1.forEach(function (v) {
                                    var tmp = {};
                                    newList.push(tmp)
                                    list.push([tmp, v]);
                                });
                                continue;
                            }
                            to[key] = o = {}
                        }
                        list.push([o, o1]);
                    }
                    else
                        to[key] = o1;
                }
            }

            while (statck.length > 0) {
                var tmp = statck.pop()
                var t = tmp[0]
                var f = tmp[1]

                _extern(t, f, statck)
            }
        }

        return to;
    }

    function copy(from) {
        var to = {}
        return extend(to, from)
    }

    function copyAugment(target, src, keys) {
        var i = keys.length
        var key
        while (i--) {
            key = keys[i]
            def(target, key, src[key])
        }
    }
    var arrayKeys = Object.getOwnPropertyNames(arrayMethods)
    function Observer(value, isArray) {
        this.value = value;
        this.deps = [];
        def(value, '__ob__', this);

        this.walk = function (value) {
            var keys = Object.keys(value);
            for (var i in keys) {
                var key = keys[i];
                this.convert(key, value[key]);
            }
        }

        this.convert = function (key, value) {
            this.defineReactive(this.value, key, value);
        }

        this.defineReactive = function (obj, key, val) {
            var dep = new Dep(key);
            var childOb = observer(val);
            if (childOb) {
                childOb.deps.push(dep)
            }
            Object.defineProperty(obj, key, {
                enumerable: true,
                configurable: true,
                get: function () {
                    // 说明这是watch 引起的
                    if (Dep.target) {
                        dep.addSub(Dep.target)
                    }
                    return val
                },
                set: function (newVal) {

                    if (newVal === val) return;

                    var oldChildOb = val && val.__ob__
                    if (oldChildOb) {
                        oldChildOb.deps.$remove(dep)
                    }
                    val = newVal
                    // add dep to new value
                    var newChildOb = observer(newVal)
                    if (newChildOb) {
                        newChildOb.deps.push(dep)
                    }
                    dep.notify(this, key, newVal);
                }
            });
        }

        this.observeArray = function (items) {
            var i = items.length
            while (i--) {
                observer(items[i])
            }
        }

        this.notify = function () {
            var deps = this.deps
            for (var i = 0, l = deps.length; i < l; i++) {
                var dep = deps[i];
                dep.notify.apply(dep, arguments);
            }
        }

        if (isArray) {
            copyAugment(value, arrayMethods, arrayKeys)
            this.observeArray(value)
        } else {
            this.walk(value);
        }
    }


    function observer(value) {
        if (
            value &&
            value.hasOwnProperty('__ob__') &&
            value.__ob__ instanceof Observer
        ) {
            return value.__ob__
        } else if (Array.isArray(value)) {
            return new Observer(value, true)
        } else if ((Object.prototype.toString.call(value) === '[object Object]')) {
            return new Observer(value, false)
        } else {
            // assert(false, 'observer not support!!!')
        }
    }



    function Watcher(vm, expOrFn, cb) {
        this.cb = cb;
        this.vm = isObject(vm) ? vm : { value: vm }; // call 传递的this 必需是一个object
        this.expOrFn = expOrFn;

        this.update = function () {
            const value = this.getValue();
            if (value != this.value || Array.isArray(value)) {
                this.value = value;
                var cb = this.cb;
                if (cb && isFunction(cb)) {
                    cb.apply(this, arguments);
                }
            }
        }

        this.getValue = function () {
            var value;
            try {
                value = isFunction(this.expOrFn) ? this.expOrFn.call(this.vm) : this.vm[expOrFn];
            } catch (e) {
                console.log('e:', e)
            }
            return value === null ? '' : value;
        }

        this.get = function () {
            Dep.target = this
            var value = this.getValue();
            Dep.target = null
            return value
        }
        this.addDep = function (dep) {
            dep.addSub(this);
        }
        this.value = this.get();
    }

    /**
     * vm  : {key: value}
     * expOrFn  : function(){return this.key}
     * cb : function(vm, key, value){}  , this: Watcher Object
     */
    function $watcher(vm, expOrFn, cb) {
        observer(vm);
        return new Watcher(vm, expOrFn, cb);
    }


    /****
     * node
     */
    var nodeId = 0;
    function Node() {
        this.nodeId = nodeId++;
        // this.uid = null;
        // this.el = null;
        // this.vm = null;
        // this.type = null;
        // this.component = null;
        // this.parent = null;
        // this.style = null;
        // this.attrs = null;

        global.TNodeEngine.addNode(this);
    };
    {
        var p = Node.prototype;
        p.setAttr = function (name, value) {
            value = stringify(value);
            if (this.attrs[name] !== value) {
                this.attrs[name] = value;
                TNodeEngine.setAttr(this.nodeId, name, value);
            }
        }
        p.setStyle = function (name, value) {
            if (value !== this.style[name]) {
                this.style[name] = value;
                TNodeEngine.setStyle(this.nodeId, name, value);
            }
        }

        p.idsForNodes = function (nodes) {
            var ids = [];
            nodes.forEach(function (node) { ids.push(node.nodeId) });
            return ids;
        }

        p.indexsOfUid = function (uid) {
            var ids = [];
            this.subNodes.forEach(function (node, idx) { if (uid === node.uid) ids.push(idx); });
            return ids;
        }

        p.indexOfUid = function (uid) {
            for (var i = 0; i < this.subNodes.length; ++i) {
                if (this.subNodes[i].uid == uid) {
                    return i;
                }
            }
            return -1;
        }
        p.indexOfInsertUid = function (uid) {
            for (var i = 0; i < this.subNodes.length; ++i) {
                if (this.subNodes[i].uid > uid) {
                    return i;
                }
            }
            return this.subNodes.length;
        }

        //增
        p.insertSubNodesAtIndex = function (nodes, idx) {
            if (nodes.length > 0) {
                for (var i = 0; i < nodes.length; ++i) {
                    this.subNodes.splice(idx + i, 0, nodes[i]);
                }
                TNodeEngine.insertSubNodesAtIndex(this.nodeId, this.idsForNodes(nodes), idx);
            }
        }
        //删
        p.removeSubNodesAtIndexs = function (indexs) {
            var nodes = this.subNodes.splice(indexs[0], indexs.length);
            if (nodes.length > 0)
                TNodeEngine.removeSubNodesAtIndexs(this.nodeId, indexs);
        }
        //改
        p.replaceSubNodesAtIndexs = function (nodes, idx) {
            var indexs = []
            for (var i = 0; i < nodes.length; ++i) {
                const index = idx + i;
                indexs.push(index)
                this.subNodes.splice(index, 1, nodes[i])
            }
            TNodeEngine.replaceSubNodesAtIndexs(this.nodeId, this.idsForNodes(nodes), indexs);
        }


        p.addSubNodes = function (subNodes) {
            this.insertSubNodesAtIndex(subNodes, this.subNodes.length);
        }
        p.removeSubNodeAtIndex = function (idx) {
            this.removeSubNodesAtIndexs([idx])
        }
        p.removeSubNodesWithUid = function (uid) {
            this.removeSubNodesAtIndexs(this.indexsOfUid(uid))
        }
        p.replaceSubNodesAtUid = function (nodes, uid) {
            const indexs = this.indexsOfUid(uid)
            this.removeSubNodesAtIndexs(indexs)
            this.insertSubNodesAtIndex(nodes, indexs.length ? indexs[0] : this.subNodes.length)
        }
        p.replaceSubNodeAtIndex = function (node, idx) {
            this.replaceSubNodeAtIndex([node], idx)
        }

        p.postMsg = function (msg, args) {
            TNodeEngine.postMessage(this.nodeId, { 'msg': msg, 'args': args || {} });
        }
        p.$onEvent = function (type, args) {
            var name = this.attrs[type];
            var c = this.component;
            var fun = c[name];
            if (isFunction(fun)) {
                try {
                    fun.call(c, { 'target': this, 'args': args || {} });
                } catch (e) {
                    console.log('$onEvent' + e + ' type:' + type + ' name:' + name);
                }
            } else {
                console.log('$onEvent type fun error....', type)
            }
            //...
        }

        Object.keys(p).forEach(function (k) {
            def(p, k, p[k], false);
        });
    }



    function Component(options) {
        extend(this, options.methods, true);
        var vmdata = options.vmdata;
        var data = isFunction(this.data) ? this.data() : this.data;
        if (vmdata) {
            data = !data ? vmdata : extend(data, vmdata)
        }

        this.data = data || {};
        Object.defineProperty(this, 'data', {
            // value: data,
            enumerable: false,
            writable: false,
            configurable: false,
        });
        return this;
    };

    Component.prototype = {
        $watch: function (key, cb) {
            $watcher(this.data, key, cb)
        },
        $getKeyPath: function (keyPath) {
            if (keyPath == null) return;
            var r = this.data;
            var chain = keyPath.split('.');
            for (var i = 0; i < chain.length; ++i) {
                r = r[chain[i]];
                if (!r) break;
            }
            return r;
        },
        $getId: function (id) {
            return this.$(id);
        },
        $rootComponent: function () {
            var rootNode = this.$getId();
            var node = rootNode;
            while (node && node.parent) {
                node = node.parent;
            }
            return node ? node.component : null;
        },
        $postMsg: function (msg, args) {
            var rootNode = this.$getId();
            if (rootNode) rootNode.$postMsg(msg, args);
        },
        $onNotify: function (name, callback) {
            var component = this.$rootComponent();
            if (component && name && callback) {
                if (!component._notifys) component._notifys = [];
                var notifys = component._notifys;
                var items = notifys[name];
                if (!items) {
                    items = [];
                    notifys[name] = items;
                }
                items.push(callback);
            }
        },
        $sendNotify: function (name, args) {
            var component = this.$rootComponent();
            if (component && component._notifys) {
                var items = component._notifys[name];
                items && items.forEach(function (v, i) {
                    if (isFunction(v)) {
                        v(args);
                    }
                });
            }
        },
        $postNativeNotify: function (name, args) {
            this.$postMsg('#notify', { 'name': name, 'args': args || {} });
        },
        $openURL: function (url) {
            this.$postMsg('#openURL', (isString(url) ? { 'url': url } : url));
        },
        $goback: function (args) {
            this.$postMsg('#goback', args);
        },
        $setTitle: function (text) {
            this.$postMsg('#setTitle', { 'title': text || "" });
        },
    }
    TNodeEngine.use = function (m) {
        if (m && isFunction(m.install)) {
            m.install(Component, null);
        }
    }

    function initComponent(component, rootNode) {
        var weak_rootNode = __weakOf(rootNode);
        component.$ = function (id) {
            if (!id) return weak_rootNode();
            var nodes = [weak_rootNode()];
            while (nodes.length > 0) {
                var currentNode = nodes.shift();
                if (currentNode.attrs.id === id) {
                    return currentNode
                }

                var subNodes = currentNode.subNodes || [];
                for (var i = 0; i < subNodes.length; ++i) {
                    nodes.push(subNodes[0])
                }
            }
        }
        if (isFunction(component.ready)) {
            try {
                component.ready();
            } catch (e) {
                console.log(e);
                assert(false, e);
            }
        }
    }

    function toNode(module, vmdata, newEl, parent) {
        function binding(vm, k, value, cb) {
            var w = $watcher(vm, value, function (vm, key, value) {
                if (cb) cb.call(vm, k, value);
            });
            return w.value;
        }

        function toStyle(className, styles) {
            var classList = ['*']
            if (className) {
                var styleName = className.split(' ')
                for (var i = 0; i < styleName.length; ++i) {
                    classList.push('.' + styleName[i])
                }
            }

            var style = {};
            for (var i = 0; i < classList.length; ++i) {
                var v = styles[classList[i]]
                for (var k in v) { style[k] = v[k] }
            }
            return style;
        }

        function getAttrs(vm, el, cb, format) {
            var attrs = {};
            el.attrs && Object.keys(el.attrs).forEach(function (key) {
                var value = el.attrs[key];
                attrs[key] = format ? stringify(value) : value;
            });

            el.bindattrs && Object.keys(el.bindattrs).forEach(function (key) {
                if (key === 'if' || key === 'repeat')
                    return;
                var value = el.bindattrs[key];
                const w = binding(vm, key, value, cb);
                attrs[key] = w;
                // attrs[key] = format ? stringify(w) : w;
            });
            return attrs;
        }

        function if_parser(ctx) {
            var el = ctx.el;
            var vm = ctx.vm;
            if (el.bindattrs && el.bindattrs.if) {
                var subContext = copy(ctx);
                subContext.el = copy(el)
                subContext.el.bindattrs = copy(el.bindattrs);
                delete subContext.el.bindattrs.if;

                const makeIfNode = function (k, v) {
                    const idx = ctx.parent.indexOfUid(ctx.el.uid)
                    if (v) {
                        if (-1 === idx) {
                            var subNode = newNode(subContext)
                            if (subNode) {
                                ctx.parent.insertSubNodesAtIndex([subNode], ctx.parent.indexOfInsertUid(ctx.el.uid));
                            }
                        }
                    } else {
                        if (-1 !== idx) {
                            ctx.parent.removeSubNodesWithUid(ctx.el.uid)
                        }
                    }
                }
                const value = binding(vm, 'if', el.bindattrs.if, makeIfNode);
                const node = value ? newNode(subContext) : null;
                return [true, node];
            }
            return [false,];
        }

        function template_parser(ctx) {
            var el = ctx.el;
            if (el.type !== 'template') return [false,];

            var module = ctx.module;
            var parent = ctx.parent;
            var vm = ctx.vm;

            const m = module.findModule(module.require(el.attrs.src).id);
            {
                var templates = extend({}, m.exports.template)
                templates.uid = el.uid
                if (el.attrs && el.attrs.length > 1) {
                    var attrs = extend({}, el.attrs)
                    delete attrs.src;
                    var newAttrs = extend({}, templates.attrs)
                    extend(newAttrs, attrs)

                    templates.attrs = newAttrs;
                }

                if (el.bindattrs) {
                    var bindattrs = {}
                    extend(bindattrs, templates.bindattrs)
                    extend(bindattrs, el.bindattrs)
                    delete bindattrs.if;

                    if (bindattrs.databinding) {
                        vm = binding(vm, 'databinding', bindattrs.databinding, null);
                        delete bindattrs.databinding;
                    }

                    templates.bindattrs = bindattrs;
                }
            }



            var node = toNode(m, vm, templates, parent); //? parent ...attrs
            // if (node) {
            //     var attrs = getAttrs(vm, el, function (key, newVal) {
            //         node.vm[key] = newVal;
            //     });
            //     delete attrs['type'];
            //     delete attrs['src'];
            //     extend(node.vm, attrs);
            // }
            return [true, node];
        }

        function repeat_parser(ctx) {
            var el = ctx.el;
            var bindattrs = el.bindattrs;
            if (!(bindattrs && bindattrs.repeat && isFunction(bindattrs.repeat))) return [false,];

            var parent = ctx.parent;
            var vm = ctx.vm;
            var styles = ctx.styles;
            var component = ctx.component;
            var module = ctx.module;

            var subel = copy(el)
            subel.bindattrs = copy(bindattrs)
            delete subel.bindattrs.repeat;

            var weak_parent = __weakOf(parent);
            const repeat =
                (function (list) {
                    var subNodes = [];
                    var parent = weak_parent();
                    if (parent) {
                        Array.isArray(list) && list.forEach(function (v) {
                            var subContext = copy(ctx)
                            subContext.vm = v;
                            subContext.el = subel;

                            var node = newNode(subContext)
                            if (node) subNodes.push(node);
                        });
                    }
                    return subNodes;
                });

            const repeatNode = (function (list) {
                var parent = weak_parent();
                if (parent) {
                    parent.replaceSubNodesAtUid(repeat(list), el.uid)
                }
            });

            const watchCallBack = function (obj, key, newVal) {
                var parent = weak_parent();
                if (!parent)
                    return;

                if ('push' === key) {
                    parent.insertSubNodesAtIndex(repeat(newVal), parent.indexOfInsertUid(el.uid));
                } else if ('pop' === key) {
                    parent.removeSubNodeAtIndex(obj.length);
                } else if ('shift' === key) {
                    parent.removeSubNodeAtIndex(0);
                } else if ('unshift' === key) {
                    parent.insertSubNodesAtIndex(repeat(newVal), 0);
                } else if ('splice' === key) {
                    var index = newVal[0];
                    var howmany = newVal[1];
                    var newItem = newVal.length > 2 ? newVal[2] : null;

                    var nodes = newItem ? repeat([newItem]) : []
                    if (index >= 0) {
                        if (howmany > 0) {
                            for (var i = 0; i < howmany; ++i) {
                                if (nodes.length > 0) {
                                    parent.replaceSubNodeAtIndex(nodes[0], index + i);
                                } else {
                                    parent.removeSubNodeAtIndex(index + i);
                                }
                            }
                        } else {
                            parent.insertSubNodesAtIndex(nodes, index);
                        }
                    } else {
                        for (var i = 0; i < howmany; ++i) {
                            if (nodes.length > 0) {
                                parent.replaceSubNodeAtIndex(nodes[0], obj.length - 1);
                            } else {
                                parent.removeSubNodeAtIndex(obj.length - 1);
                            }
                        }
                    }
                }
                else {
                    repeatNode(newVal);
                }
            };

            var repeatFun = bindattrs.repeat;
            var w = $watcher(vm, repeatFun, watchCallBack);
            return [true, repeat(w.value)];
        }

        function newNode(ctx) {
            var parsers = [if_parser, template_parser, repeat_parser];
            for (var i = 0; i < parsers.length; i++) {
                var result = parsers[i](ctx);
                if (true === result[0]) {
                    return result[1];
                }
            }

            var node = new Node();
            node.el = ctx.el;
            node.vm = ctx.vm;
            node.component = ctx.component;
            node.uid = ctx.el.uid;
            node.type = ctx.el.type;
            node.parent = ctx.parent;
            node.style = toStyle(ctx.el.class, ctx.styles);
            node.attrs = {}
            var weak_node = __weakOf(node);
            node.attrs = getAttrs(node.vm, node.el, function (key, newVal) {
                if (newVal === null) newVal = '';
                var node = weak_node();
                if (node) {
                    if ('class' === key) {
                        var style = toStyle(newVal, ctx.styles);
                        if (style) {
                            for (var k in style) {
                                node.setStyle(k, style[k])
                            }
                        }
                    } else {
                        node.setAttr(key, newVal);
                    }
                } else {
                    console.log('node is null');
                }
            }, true);
            if (node.attrs && node.attrs.class) { // class ={{x}}
                node.style = toStyle(node.attrs.class, ctx.styles);
                delete node.attrs.class;
            }
            node.subNodes = [];

            if (global.$.debug) {
                enabledEnumerables(node, ['el', 'vm', 'component', 'parent'/*, 'subNodes'*/], false);
            } else {
                enabledEnumerables(node, ['el', 'vm', 'component', 'parent', 'subNodes'], false);
            }

            TNodeEngine.makeNode(node.nodeId, (node.parent ? node.parent.nodeId : -1), node, { 'nodeId': node.nodeId, 'uid': node.uid, 'type': node.type, 'styles': node.style, 'attrs': node.attrs });

            var subNodes = [];
            var children = node.el.children;
            Array.isArray(children) && children.forEach(function (subel) {
                var subContext = copy(ctx)
                subContext.parent = node;
                subContext.el = subel;
                var subNode = newNode(subContext);
                if (subNode) {
                    if (Array.isArray(subNode)) {
                        subNodes = subNodes.concat(subNode)
                    } else {
                        subNodes.push(subNode);
                    }
                }
            });
            if (subNodes.length) node.addSubNodes(subNodes)
            return node;
        }

        var component = new Component({ 'methods': module.exports.methods, 'vmdata': vmdata });
        var context = {
            'module': module,
            'el': newEl ? newEl : module.exports.template || {},
            'styles': module.exports.style || {},
            'vm': component.data,
            'component': component,
            'parent': parent
        };

        var rootNode = newNode(context);
        initComponent(component, rootNode);
        return rootNode;
    }


    global.makeNodes = function (module, vmdata) {
        try {
            var node = toNode(module, vmdata);
            return node;
        } catch (e) {
            console.log('makeNodes error:', e);
        }
        return null;
    }

    global.render = function (code, funName, vmdata, options) {
        var rootNode = null;
        try {
            var module = new global.Module(code);
            var m = module.findModule(funName ? module.require(funName).id : module.id)
            rootNode = global.makeNodes(m, vmdata);
            if (global.$.debug) {
                var json = JSON.stringify(rootNode, null, 2)
                console.log('render: ', json, '\n\n')
                if (global.$.nodejs === true) {
                    const fs = require('fs')
                    const path = require('path')

                    fs.writeFile(path.join(__dirname, './test.json'), json)
                }
            }
        } catch (error) {
            console.log('render error ', error)
        }

        return rootNode ? rootNode.nodeId : -1;
    }

    for (var name in global) {
        Object.defineProperty(global, name, {
            enumerable: false,
            configurable: false,
        });
    }

    Object.freeze(global);
    Object.freeze(global.TNodeEngine);
    Object.freeze(Node.prototype);


    // TNodeEngine.use({
    //     install(c, options) {
    //         c.prototype.$api = function () {
    //             console.log('$api');
    //         }
    //     }
    // })

    // Object.freeze(Object),
    // Object.freeze(Array),
    // Object.freeze(Object.prototype),
    // Object.freeze(Array.prototype),
    // Object.freeze(String.prototype),
    // Object.freeze(Number.prototype),
    // Object.freeze(Boolean.prototype),
    // Object.freeze(Error.prototype),
    // Object.freeze(Date.prototype),
    // Object.freeze(RegExp.prototype)
    // Object.freeze(global)
})(typeof global === 'undefined' ? this : global, typeof module === 'undefined' ? {} : module)