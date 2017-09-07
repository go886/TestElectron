exports.send = function(args) {
    var callback = function(){
        console.log('test3');
    } ;
    
    // TNodeEngine.callNative(module,'send', args, callback);


    // //Native 端
    // var callId = 0;
    // TNodeEngine.callJS(callId, args);
}