const express = require('express');
const path = require("path")
const { config } = require('./setting');
const dsl = require('./dsl');
const electron = require('electron');
const net = require('net');


// 检测port是否被占用
function probe(port, callback) {
  var server = net.createServer().listen(port)
  var calledOnce = false
  var timeoutRef = setTimeout(function () {
    calledOnce = true
    callback(false, port)
  }, 2000)

  timeoutRef.unref()
  var connected = false
  server.on('listening', function () {
    clearTimeout(timeoutRef)

    if (server)
      server.close()

    if (!calledOnce) {
      calledOnce = true
      callback(true, port)
    }
  })

  server.on('error', function (err) {
    clearTimeout(timeoutRef)

    var result = true
    if (err.code === 'EADDRINUSE')
      result = false

    if (!calledOnce) {
      calledOnce = true
      callback(result, port)
    }
  })
}


var server = express()
var dir = '../view';
if (process.env.NODE_ENV === 'development') {
  dir = '../client/dist'
}
server.use(express.static(path.resolve(__dirname, dir)));
server.use(express.static(path.join(electron.app.getPath('userData'), 'images')))
server.get('/js', function (req, res) {
  const uid = req.params.uid || 0;
  var r = dsl.maping[uid] || { json: '{}' };
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(r.json);
});


function run(port) {
  probe(port, function (ret, port) {
    if (ret) {
      server.listen(port, function (r, q) {
        console.log('Example app listening on port' + port);
      });
    } else {
      run(port + 1);
    }
  });
}
run(config.port || 8081)

server.URL = config.serverurl;
module.exports.server = server;