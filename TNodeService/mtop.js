exports.mtop = {
    send(args, callback) {
        callback('abc')
        TNodeService.sendNativeMessage({type:'mtop', args:{}}, callback);
    }
}