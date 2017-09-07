const path = require("path")
const fs = require("fs");
const mustache = require('mustache')
const { setting } = require('./setting')
var xmlreader = require('./third/xmlreader')
const api = require('../main-api.js')

function sendmessage(args) {
    return api.sendMessage(args);
}

function jsFormat(es6Code) {
    const babel = require('babel-core');
    var es5Code =
        babel.transform(es6Code, {
            presets: ['es2015']
        }).code;

    // var t = require('uglify-js')
    // var jsp = require("uglify-js").parser;
    // var pro = require("uglify-js").uglify;

    // var orig_code = es5Code;
    // var ast = jsp.parse(orig_code); // parse code and get the initial AST
    // ast = pro.ast_mangle(ast); // get a new AST with mangled names
    // ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
    // var final_code = pro.gen_code(ast); // compressed code here




    return es5Code;
}

var maping = {}
var log = console.log;
function isFunction(v) {
    var getType = {};
    return v && getType.toString.call(v) == '[object Function]';
};

function isString(v) {
    return v && (typeof v === "string");
}
function isBindAttr(value) {
    const reg = /\{\{[^\}\}]+\}\}/i;
    return value.match(reg) != null;
}


function unique(array) {
    var n = [];//临时数组
    for (var i = 0; i < array.length; i++) {
        if (n.indexOf(array[i]) == -1) n.push(array[i]);
    }
    return n;
}

function getKeyPath(vm, keyPath) {
    if (keyPath == null) return vm;
    var chain = keyPath.split('.');
    for (var i = 0; i < chain.length; ++i) {
        vm = vm[chain[i]];
        if (!vm) break;
    }
    return vm;
}

function toXMLValue(v) {
    return v.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
}

function dslToXML(template) {
    template = template.replace(/\s+(if)\s*=\s*"(.*?)"(\s+|\/\>|\>)/mg, function (item, k, v, e) {
        var value = " " + k + '="' + toXMLValue(v) + '"' + e;
        return value;
    });

    template = template.replace(/\s+(if)\s*=\s*'(.*?)'(\s+|\/\>|\>)/mg, function (item, k, v, e) {
        var value = " " + k + "='" + toXMLValue(v) + "'" + e;
        return value;
    });

    return template;


    // const reg = /\w+\s*=\s*'(.*[&><"].*)'(?=\s+|[>])/mg;
    // var t = template.replace(reg, function (word) {
    //     return word.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    // });

    // t = t.replace(/\w+\s*=\s*"(.*[&><'].*)"(?=\s+|\/\>)/mg, function (word) {
    //     return word.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/'/g, '&apos;');
    // });
    // return t;
}

function parserHtml(template) {
    var rootNode;
    xmlreader.read(dslToXML(template), function (err, res) {
        if (err) return console.log(err);
        rootNode = res;
    });

    if (rootNode && rootNode.type === 'body') {
        return rootNode.childrens[0];
    }

    return rootNode;
}

function removeCssComment(str) {
    const r = /\/\*[\s\S]*?\*\//mg
    // const r2 = /\<\!--.*--\>/g;
    // return str.replace(r, '').replace(r2,'');
    // const r = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g
    return str.replace(r, '');
}

function parserStyle(css) {
    css = removeCssComment(css);
    //  const reg = /^([\.\#]?\w+)[^{]+\{([^}]*)\}/mg;
    const reg = /^([^{]+)\{([^}]*)\}/mg;
    const r = /(.*?):(.*?);/g;

    var cssRootNode = {};
    var items = [];
    while ((items = reg.exec(css))) {
        var keys = items[1];
        var value = items[2];

        var cssItem = {};
        var values = []
        while ((values = r.exec(value))) {
            cssItem[values[1].trim()] = values[2].trim();
        }

        keys.split(',').forEach(function (k) {
            cssRootNode[k.trim()] = cssItem; //多keys
        });
    }

    return cssRootNode;
}

function parserScript(code) {
    return eval(code);
}

function isSketchFile(str) {
    const r = /<html[^>]* sketch=\"true\"/i
    return (str.match(r) != null);
}

function removeSketchPX(str) {
    const r = /(\d+)px\b/mg;
    return str.replace(r, '$1')
}

function replaceFilePath(str) {
    const r = /\"\.\//mg;
    const serverURL = "\"" + setting.serverurl + '/uid/'

    return str.replace(r, serverURL)
}



/**js */
function parser_js_imp(fullname) {
    function getAllNode(root) {
        var stack = []
        var nodes = []
        if (root) {
            stack.push(root)
            while (stack.length > 0) {
                var tmpNode = stack.pop()
                nodes.push(tmpNode)
                if (tmpNode.children && Array.isArray(tmpNode.children)) {
                    for (var i = 0; i < tmpNode.children.length; ++i) {
                        stack.push(tmpNode.children[i])
                    }
                }
            }
        }

        return nodes;
    }

    function parserTemplateDependence(template, dir) {
        var nodes = getAllNode(template)
        var paths = []
        nodes && nodes.forEach(function (v, i) {
            if (v.type == 'template' && v.attrs && v.attrs.src) {
                var fullName = path.join(dir, v.attrs.src)
                paths.push(fullName)
            }
        });
        return paths;
    }

    function parserRequireDependence(code, dir) {
        const reg = /require\(\'([\s\S]+?)\'\)/mg;
        var result = []
        var items = [];
        while ((items = reg.exec(code))) {
            var name = items[1];
            name = path.join(dir, name)
            if (fs.existsSync(name)) result.push(name)
        }

        const reg2 = /require\(\"([\s\S]+)\"\)/mg;
        while ((items = reg2.exec(code))) {
            var name = items[1];
            name = path.join(dir, name)
            if (fs.existsSync(name)) result.push(name)
        }

        return result
    }

    function _convertBindAttr(k, src) {
        const isif = (k === 'if')
        var l = mustache;
        var tokens = l.parse(src);
        var s = [];
        var keys = [];
        tokens.forEach(function (item) {
            if (item[0] == 'text')
                isif ? s.push(item[1]) : s.push('"' + item[1] + '"')
            else {
                var v = item[1];
                if (v.indexOf('|') !== -1) {   //兼容native 版本 filter...
                    const index = v.indexOf('|');
                    var filters = v.substring(index + 1).split('|')
                    v = v.substring(0, index);
                    Array.isArray(filters) && filters.forEach(function (f) {   // 兼容native 的 |len Filter
                        if (f.trim() === 'len') {
                            v += '.length';
                        }
                    });
                }
                if (v.indexOf('$') == 0) {
                    s.push(v);
                } else if (v === '.') {
                    s.push('this.value');
                } else {
                    s.push('this.' + v);
                }
                keys.push("'" + v + "'");
            }
        });

        if (keys.length > 0) {
            s = isif ? s.join('') : s.join(' + ');
            return "function(){ return " + s.toString() + "}";
        }

        return src;
    }
    function convertBindAttrs(template) {
        var nodes = getAllNode(template)
        nodes && nodes.forEach(function (v, i) {
            var node = v;
            node.bindattrs && Object.keys(node.bindattrs).forEach(function (key, i) {
                node.bindattrs[key] = _convertBindAttr(key, node.bindattrs[key])
            });
        });
        return template
    }

    function parserJSTemplate(fullname) {
        if (!fs.existsSync(fullname)) {
            return
        }
        var module = {
            path: fullname,
            code: null,
            dependence: [],
        }
        const dir = path.dirname(fullname)

        const mockEnabled = setting.mock;
        var code = fs.readFileSync(fullname, 'utf8');
        const isSketch = isSketchFile(code)
        var template = isString(code) && code.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (!template) template = isString(code) && code.match(/<html[^>]*>([\s\S]*)<\/html>/i);

        if (template) {
            template = template[1];
            if (mockEnabled) {
                template = replaceFilePath(template);
            }
            var templates = parserHtml(template) || {}
            templates = convertBindAttrs(templates)

            if (isSketch) {
                templates = {
                    type: 'scrollView',
                    uid: 0,
                    children: [templates],
                    attrs: {
                        scrollsToTopEnabled: true,
                        flex: 1,
                    }
                }
            }

            module.dependence = parserTemplateDependence(templates, dir)

            var styles = code.match(/<style[^>]*>([\s\S]*)<\/style>/i);
            if (styles) {
                styles = removeSketchPX(styles[1]);
                styles = parserStyle(styles);
            }
            var script = code.match(/<script[^>]*>([\s\S]*)<\/script>/i);
            if (script) script = script[1];

            module.dependence = module.dependence.concat(parserRequireDependence(script, dir))
            if (templates) {
                templates =
                    JSON.stringify(templates, function (key, value) {
                        if (key == 'if') {
                            value = value.replace(/\"(.*?)\"/g, '\'$1\'');
                        }
                        return value;
                    });
                templates = 'exports.template = ' + templates + ';\n';
                // templates = templates.replace(/\\"/g, '"')
                // json 会对 "  作转义 所以这里要去掉 \"
            }
            templates = templates.replace(/"function\(\)\{(.*?)\}"/g, 'function(){$1}')
            if (styles) styles = 'exports.style = ' + JSON.stringify(styles) + ';';
            module.code = templates + styles + script //jsFormat(script);
        } else {
            module.dependence = module.dependence.concat(parserRequireDependence(code, dir))
            module.code = code
        }

        return module
    }


    var modules = []
    var modulesMap = {}
    var stackModules = []
    var watchFiles = []
    var err = null;

    stackModules.push(fullname)
    while (stackModules.length > 0) {
        var p = stackModules.pop()
        if (!modulesMap[p]) {
            modulesMap[p] = true;
            var module = parserJSTemplate(p)
            if (module) {
                modules.push(module)
                if (module.dependence) {
                    for (var i = 0; i < module.dependence.length; ++i) {
                        var subPath = module.dependence[i];
                        if (!modulesMap[subPath]) {
                            stackModules.push(subPath)
                        }
                    }
                }
            }
        }
    }

    var dir = path.dirname(fullname)
    var result = ''
    for (var i = modules.length - 1; i >= 0; --i) {
        var m = modules[i];
        watchFiles.push(m.path)
        if (i == 0) {
            result += m.code;
        } else {
            var shortName = path.relative(dir, m.path)
            // var shortName = m.path.replace(dir, '.')
            result += '/****** ' + shortName + ' begin ******/\n'
            result += "require('" + shortName + "', function(module, exports, require) {\n"
            result += m.code
            result += '\n});;\n/****** ' + shortName + ' end ******/\n\n\n'
        }
    }

    result = jsFormat(result);

    if (process.env.NODE_ENV === 'development') {
        // const key = 'www.xiain.com ??'

        const key = '363fafecfd4d7c9d5f5853ee8a1a9776'
        const aes256 = require('./third/aes256');
        const fs = require('fs')
        const path = require('path')
        var code = fs.readFileSync(path.join(__dirname, '/tnodejs/mini-core-d.js'), 'utf8');
        if (code) {
            var ciphertext = aes256.encrypt(key, code);
            fs.writeFile(path.join(__dirname, '/tnodejs/mini-core.js'), ciphertext)
            console.assert(aes256.decrypt(key, ciphertext) == code)

            require(path.join(__dirname, './tnodejs/mini-core-d.js'))
            global.render(result, null, null)
        }
    }


    return { result: result, files: watchFiles, err: err }
}
/**js -- end */



function parser_n_imp(fullname) {
    function parserTemplate(path) {
        const mockEnabled = setting.mock;
        var code = fs.readFileSync(path, 'utf8');
        const isSketch = isSketchFile(code)
        if (mockEnabled) {
            code = replaceFilePath(code);
            // fs.writeFile(path + '.json', code)
        }
        var template = isString(code) && code.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (!template) template = isString(code) && code.match(/<html[^>]*>([\s\S]*)<\/html>/i);

        if (template) {
            template = template[1];
            var templates = parserHtml(template) || {}
            // templates = convertBindAttrs(templates);

            if (isSketch) {
                templates = {
                    type: 'scrollView',
                    uid: 0,
                    children: [templates],
                    attrs: {
                        scrollsToTopEnabled: true,
                        flex: 1,
                    }
                }
            }

            var styles = code.match(/<style[^>]*>([\s\S]*)<\/style>/i);
            if (styles) {
                styles = removeSketchPX(styles[1]);
                styles = parserStyle(styles);
                if (styles) templates['_styles'] = styles;
            }
            var script = code.match(/<script[^>]*>([\s\S]*)<\/script>/i);
            if (script) {
                script = parserScript(script[1])
                if (script) {
                    if (mockEnabled || (true === script._valid)) {
                        templates['_data'] = script;
                    }

                    if (script["#tnode"]) {
                        templates['#tnode'] = script["#tnode"];
                        delete script["#tnode"];
                    }
                }
            }

            return templates;
        }
    }

    function getAllNode(root) {
        var stack = []
        var nodes = []
        if (root) {
            stack.push(root)
            while (stack.length > 0) {
                var tmpNode = stack.pop()
                nodes.push(tmpNode)
                if (tmpNode.children && Array.isArray(tmpNode.children)) {
                    for (var i = 0; i < tmpNode.children.length; ++i) {
                        stack.push(tmpNode.children[i])
                    }
                }
            }
        }

        return nodes.reverse();
    }

    function _convertBindAttr(k, src) {
        const isif = (k === 'if')
        if (!isif) return src;

        const r = /\'(.*?)\'/mg
        const r2 = /\"(.*?)\"/mg
        src = src.replace(/\'\{\{(.*?)\}\}\'/mg, '{{$1}}').replace(/\"\{\{(.*?)\}\}\"/mg, '{{$1}}')
        // 解决native 情况下 ： "'{{globalUi.showType}}' == 'emoji'"
        const hasToken = (src.match(r) !== null) || (src.match(r2) !== null);   //解决native 情况下原有if 下 ' " 等问题

        var l = mustache;
        var tokens = l.parse(src);
        var s = [];
        var keys = [];
        tokens.forEach(function (item) {
            function removeToken(s) {
                return hasToken ? s.replace(/(.*?)\"(.*?)\"(.*?)/mg, "$1'$2'$3") : s;
            }

            function removeToken2(s) {
                if (hasToken) {
                    var s = s.replace(/(.*?)\"(.*?)\"(.*?)/mg, "$1$2$3").replace(/(.*?)\'(.*?)\'(.*?)/mg, "$1$2$3")
                    return "'{{" + s + "}}'";
                }
                return "{{" + s + "}}";
            }

            var v = item[1]
            if (item[0] == 'text')
                s.push(removeToken(v));
            else {
                s.push(removeToken2(v));
            }
        });

        if (s.length > 0) {
            s = s.join('');
            return s;
        }

        return src;
    }
    function convertBindAttrs(template) {
        var nodes = getAllNode(template)
        nodes && nodes.forEach(function (v, i) {
            var node = v;
            node.bindattrs && Object.keys(node.bindattrs).forEach(function (key, i) {
                node.bindattrs[key] = _convertBindAttr(key, node.bindattrs[key])
            });
        });
        return template
    }

    var templates = {}; //{'$':{'version':'1.0'}}
    var stackTemplateFiles = [{ path: fullname, shortName: path.basename(fullname, '.html') }]
    var watchFiles = []
    var err = null;
    var defines = {}
    while (stackTemplateFiles.length && err == null) {
        const item = stackTemplateFiles.pop();
        const fullName = item.path;
        const shortName = item.shortName;
        const dir = path.dirname(fullName)
        if (templates[shortName]) {
            continue;
        }

        try {
            watchFiles.push(fullName);
            var template = parserTemplate(fullName) || {}
            templates[shortName] = template
            if (template["#tnode"]) {
                var def = template["#tnode"]["#define"];
                def && Object.keys(def).forEach(function (k, index) {
                    defines[k] = def[k];
                });
                delete template["#tnode"];
            }

            var nodes = getAllNode(template);
            function itorNode(node, index) {
                if (node.type == 'template' && node.attrs && node.attrs.src) {
                    var fullName = path.join(dir, node.attrs.src)
                    var shortName = node.attrs.src.replace(path.extname(fullName), '');
                    stackTemplateFiles.push({ 'path': fullName, 'shortName': shortName });
                    node.attrs.src = shortName
                }

                function def(value) {
                    return value.replace(/\#define\((.*?)\)/mg, function (value, k) {
                        return JSON.stringify(defines[k]);
                    });
                }

                node.bindattrs && Object.keys(node.bindattrs).forEach(function (key, i) {
                    node.bindattrs[key] = _convertBindAttr(key, node.bindattrs[key])
                    node.bindattrs[key] = def(node.bindattrs[key]);
                });

                node.attrs && Object.keys(node.attrs).forEach(function (key, i) {
                    var v = node.attrs[key].trim();
                    var arr = ['$://poplayer?'];
                    for (var i = 0; i < arr.length; ++i) {
                        var token = arr[i];
                        if (0 === v.indexOf(token)) {
                            v = v.substring(token.length);
                            var info = JSON.parse(v)
                            var name = info && info.src;
                            if (name) {
                                var fullName = path.join(dir, name)
                                var shortName = name.replace(path.extname(fullName), '');
                                stackTemplateFiles.push({ 'path': fullName, 'shortName': shortName });
                                info.src = shortName;
                                node.attrs[key] = token + JSON.stringify(info);
                            }
                            break;
                        }
                    }

                    var newValue = def(node.attrs[key]);
                    if (isBindAttr(newValue)) {
                        if (!node.bindattrs) node.bindattrs = {}
                        node.bindattrs[key] = newValue;
                        delete node.attrs[key];
                    } else {
                        node.attrs[key] = newValue;
                    }
                });
            };
            nodes && nodes.forEach(itorNode);
        } catch (error) {
            err = error
            err.fileName = fullName;
        }
    }

    return { result: JSON.stringify(templates), files: watchFiles, err: err }
}

function isJsTemplate(fullname) {
    var code = fs.readFileSync(fullname, 'utf8');
    if (code.match(/require\(.*?\)/i) != null) {
        return true
    }

    if (code.match(/exports\.methods/i) != null) {
        return true
    }

    return false
}
var watchHandlers = []
function parser(fullname) {
    const isJS = isJsTemplate(fullname)
    const _parser = isJS ? parser_js_imp : parser_n_imp;


    function watchs(files, callback) {
        files.forEach(function (path, index) {
            const f = fs.watch(path, callback);
            watchHandlers.push(f)
        });

    }

    function unwatchs() {
        watchHandlers.forEach(function (f, index) {
            f.close();
        });
    }


    // const server = require('./ipcserver').server;
    var result = { uid: 0, path: path.dirname(fullname) }
    var watchFiles = []
    function watchsCallback() {
        sendmessage('开始解析>>>')
        var r = _parser(fullname);
        result.json = r.result
        result.err = r.err
        watchFiles = watchFiles.concat(r.files);
        watchFiles = unique(watchFiles);

        unwatchs();
        watchs(watchFiles, watchsCallback)

        // server.sendmessage({ watchFiles: watchFiles })
        var msg = '解析成功完成!!!'
        if (r.err) {
            msg = '解析出错' + r.err.toString() + '\nfileName:' + r.err.fileName;
            console.log('msg:', msg);
        }
        sendmessage(msg + '\r\n\r\n')
    }

    result.parser = watchsCallback;
    result.type = isJS ? 'js' : 'native';
    maping[result.uid] = result;
    result.parser();
    return result;
}
exports.parser = parser;
exports.maping = maping
