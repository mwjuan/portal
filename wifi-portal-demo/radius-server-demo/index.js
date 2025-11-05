var config = require('config');
var moment = require('moment');
var _ = require('lodash');
var radius = require('radius');
var dgram = require("dgram");
var server = dgram.createSocket("udp4");

console.log(`****** RADIUS SERVER DEMO: PORT=${config.port},SECRET=${config.secret} ******`);

server.on("message", function (msg, rinfo) {
    var packet = radius.decode({ packet: msg, secret: config.secret });
    console.dir(packet);

    if (packet.code != 'Access-Request') {
        console.log('unknown packet type: ', packet.code);
        return;
    }

    var username = packet.attributes['UserName'];
    var password = packet.attributes['PassWord'];

    //'Access-Accept', 'Access-Reject'
    var result = 'Access-Reject';
    if (username == 'shgbit' && password == 'shgbit') result = 'Access-Accept';

    var response = radius.encode_response({
        packet: packet,
        code: result,
        secret: config.secret
    });

    server.send(response, 0, response.length, rinfo.port, rinfo.address, (err, bytes) => {
        if (!err) return;
        console.log('Error sending response to ', rinfo);
    });
});

server.on("listening", function () {
    var address = server.address();
    console.log("radius server listening " + address.address + ":" + address.port);
});

server.bind(config.port);