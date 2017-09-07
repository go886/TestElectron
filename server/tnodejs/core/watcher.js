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
                value = expOrFn.call(this.vm);
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