const express = require('express');
const path = require("path")
const { config } = require('./setting');
const dsl = require('./dsl');
const electron = require('electron');


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

server.listen(config.port || 8081, function (r, q) {
  console.log('Example app listening on port 3000!');
});
server.URL = config.serverurl;
module.exports.server = server;